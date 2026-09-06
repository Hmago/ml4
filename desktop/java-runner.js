// Local JDK execution for the DSA practice page.
//
// The web build compiles user code on remote sandboxes (Wandbox / Compiler
// Explorer). Those work, but they are slow, need a network, and — critically —
// forbid creating OS threads, so nothing involving Thread, ExecutorService,
// CompletableFuture or virtual threads can run there.
//
// In the desktop app we can do better: if a JDK is installed locally we compile
// and run against it. The renderer falls back to the remote sandboxes whenever
// no JDK is found or a local run fails.

const { execFile, spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const RUN_TIMEOUT_MS = 20000;
const MAX_OUTPUT_BYTES = 512 * 1024;

let cachedJdk = null;      // { javaPath, version, major, source } once detected
let detectionPromise = null;

function javaExe(home) {
  return path.join(home, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
}

// Candidate JAVA_HOME-style directories, best first.
function candidateHomes() {
  const out = [];
  if (process.env.JAVA_HOME) out.push(process.env.JAVA_HOME);

  const roots = [];
  if (process.platform === 'win32') {
    roots.push(
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Microsoft'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Java'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Eclipse Adoptium'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Amazon Corretto'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'Zulu'),
      path.join(process.env.ProgramFiles || 'C:\\Program Files', 'BellSoft'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Eclipse Adoptium'),
      path.join(os.homedir(), '.jdks')
    );
  } else {
    roots.push('/usr/lib/jvm', '/Library/Java/JavaVirtualMachines', path.join(os.homedir(), '.jdks'));
  }

  for (const root of roots) {
    let entries;
    try { entries = fs.readdirSync(root, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const dir = path.join(root, e.name);
      // macOS bundles nest the real home under Contents/Home.
      for (const home of [dir, path.join(dir, 'Contents', 'Home')]) {
        if (fs.existsSync(javaExe(home))) out.push(home);
      }
    }
  }
  return out;
}

function probeVersion(exe) {
  return new Promise((resolve) => {
    execFile(exe, ['-version'], { timeout: 8000 }, (err, stdout, stderr) => {
      if (err) return resolve(null);
      // `java -version` writes to stderr on every JDK worth supporting.
      const text = String(stderr || stdout || '');
      const m = text.match(/version "?(\d+)(?:\.(\d+))?[^"\s]*"?/);
      if (!m) return resolve(null);
      // 1.8.0_x style means Java 8; anything else uses the leading number.
      const major = m[1] === '1' ? Number(m[2] || 0) : Number(m[1]);
      const full = (text.split('\n')[0] || '').trim();
      resolve({ major, full });
    });
  });
}

// Newest usable JDK wins. Java 17 is the floor — records and sealed types are
// the whole point of the chapters this feature exists to support.
async function detectJdk(force) {
  if (cachedJdk && !force) return cachedJdk;
  if (detectionPromise && !force) return detectionPromise;

  detectionPromise = (async () => {
    const seen = new Set();
    const found = [];

    for (const home of candidateHomes()) {
      const exe = javaExe(home);
      if (seen.has(exe.toLowerCase()) || !fs.existsSync(exe)) continue;
      seen.add(exe.toLowerCase());
      const v = await probeVersion(exe);
      if (v && v.major >= 17) found.push({ javaPath: exe, major: v.major, version: v.full, source: home });
    }

    // Last resort: whatever `java` resolves to on PATH.
    if (!found.length) {
      const v = await probeVersion('java');
      if (v && v.major >= 17) found.push({ javaPath: 'java', major: v.major, version: v.full, source: 'PATH' });
    }

    found.sort((a, b) => b.major - a.major);
    cachedJdk = found[0] || null;
    return cachedJdk;
  })();

  try { return await detectionPromise; } finally { detectionPromise = null; }
}

function clip(s) {
  if (s.length <= MAX_OUTPUT_BYTES) return s;
  return s.slice(0, MAX_OUTPUT_BYTES) + '\n... output truncated ...';
}

// JEP 330's single-file source launcher compiles and runs in one step, and it
// does NOT require the filename to match the public class — so we can hand the
// user's source through untouched and keep their class names in error messages.
function runOnce(javaPath, dir, file, extraArgs, stdin) {
  return new Promise((resolve) => {
    const args = extraArgs.concat([file]);
    const child = spawn(javaPath, args, { cwd: dir, windowsHide: true });

    let stdout = '';
    let stderr = '';
    let killedBy = '';
    let settled = false;

    const timer = setTimeout(() => {
      killedBy = 'timed out after ' + (RUN_TIMEOUT_MS / 1000) + 's';
      try { child.kill('SIGKILL'); } catch { /* already gone */ }
    }, RUN_TIMEOUT_MS);

    child.stdout.on('data', (d) => { if (stdout.length < MAX_OUTPUT_BYTES) stdout += d; });
    child.stderr.on('data', (d) => { if (stderr.length < MAX_OUTPUT_BYTES) stderr += d; });
    if (stdin) { try { child.stdin.write(stdin); } catch { /* ignore */ } }
    try { child.stdin.end(); } catch { /* ignore */ }

    const finish = (code, err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ code, stdout: clip(stdout), stderr: clip(stderr), killedBy, spawnError: err || null });
    };
    child.on('error', (err) => finish(-1, err));
    child.on('close', (code) => finish(code));
  });
}

// A compile failure from the source launcher shows up as javac diagnostics on
// stderr with no program output at all.
function looksLikeCompileError(stderr) {
  return /^\S*\.java:\d+: error:/m.test(stderr) || /\berror:.*\n.*\^/m.test(stderr);
}

function needsPreview(stderr) {
  return /is a preview (API|feature)|--enable-preview|preview features are not enabled/i.test(stderr);
}

async function runJava(code, stdin) {
  const jdk = await detectJdk(false);
  if (!jdk) return { ok: false, error: 'No local JDK 17+ found.' };

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ml4-java-'));
  const file = path.join(dir, 'Main.java');
  try {
    fs.writeFileSync(file, code, 'utf8');

    let res = await runOnce(jdk.javaPath, dir, file, [], stdin);

    // Retry with preview enabled if — and only if — that is what it asked for.
    // Lets structured concurrency (JEP 505, still preview in 25) actually run.
    let usedPreview = false;
    if (res.code !== 0 && needsPreview(res.stderr)) {
      const retry = await runOnce(
        jdk.javaPath, dir, file,
        ['--enable-preview', '--source', String(jdk.major)], stdin
      );
      if (retry.code === 0 || !needsPreview(retry.stderr)) { res = retry; usedPreview = true; }
    }

    if (res.spawnError) return { ok: false, error: 'Failed to start java: ' + res.spawnError.message };

    const compileFailed = res.code !== 0 && !res.stdout && looksLikeCompileError(res.stderr);
    return {
      ok: true,
      compileError: compileFailed ? res.stderr : '',
      // Exit code 0 with stderr output means warnings, not a failure.
      runtimeError: !compileFailed && res.code !== 0
        ? (res.stderr || 'Program exited with code ' + res.code)
        : '',
      output: res.stdout,
      killedBy: res.killedBy,
      exitCode: res.code,
      usedPreview,
      version: jdk.version,
      major: jdk.major,
    };
  } catch (err) {
    return { ok: false, error: String((err && err.message) || err) };
  } finally {
    fs.rm(dir, { recursive: true, force: true }, () => {});
  }
}

function registerJavaIpc(ipcMain) {
  ipcMain.handle('java:detect', async (_e, force) => {
    const jdk = await detectJdk(!!force);
    return jdk
      ? { available: true, version: jdk.version, major: jdk.major, path: jdk.source }
      : { available: false };
  });

  ipcMain.handle('java:run', async (_e, payload) => {
    const code = payload && typeof payload.code === 'string' ? payload.code : '';
    if (!code.trim()) return { ok: false, error: 'No source code supplied.' };
    if (code.length > 400000) return { ok: false, error: 'Source is too large to run.' };
    const stdin = payload && typeof payload.stdin === 'string' ? payload.stdin : '';
    return runJava(code, stdin);
  });
}

module.exports = { registerJavaIpc, detectJdk };
