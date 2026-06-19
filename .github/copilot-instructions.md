# Copilot instructions for ml4

ML study-notes **learning platform**: ~34 Markdown chapters in `content/` plus a
zero-build, client-side single-page web app (`index.html` + `js/`) that renders
them, with quizzes, ~400 in-browser DSA problems, a mock-test bank, and a PWA /
Electron desktop wrapper. Deployed to GitHub Pages; also shipped as a Windows
desktop app. Target audience is Google AI Engineer interview prep.

## Build / run / regenerate

There is **no build step, bundler, test framework, or linter** for the web app —
it is plain HTML/CSS/vanilla JS rendered in the browser.

- **Run locally:** open `index.html` directly, or use `start.bat` / `start.sh`.
  Everything runs client-side; no server required.
- **Generation/validation tools** (Node, run from repo root). Several data files
  are **generated — edit the source, never the output**:
  - `node tools/build_mock_questions.js` (`--check` to validate only) — assembles
    `js/data/mock_questions.js` from per-chapter fragments in `tools/mock_gen/<key>.json`.
  - `node tools/validate_fragment.js <key>.md` — validate a single mock fragment.
  - `node tools/update-reading-times.js` (`--check`) — regenerates the
    `CHAPTER_MINUTES` block in `js/state.js` (between `@generated-reading-times`
    markers) from live word counts (~55 wpm model).
  - `node tools/split-dsa.js` — regenerates `js/data/dsa_problems_index.js` (metadata)
    and `js/data/dsa_problems_full.js` (starter-code lookup) from `js/data/dsa_problems.js`.
- **Desktop app** (Electron, in `desktop/`): `npm ci`, then `npm start` (dev) or
  `npm run build` (electron-builder, Windows x64). It bundles the root static
  files as `extraResources` — it does **not** have its own copy of the content.

## Architecture (the parts that span files)

- `index.html` is the shell. It loads seven **classic, non-module** scripts in a
  fixed dependency order via `<script defer>`:
  `state.js → chapter.js → pages.js → dsa.js → mock.js → pins.js → init.js`.
  They share **globals** (no `import`/`export`). Order matters — e.g. `chapter.js`
  defines the `chapters` array that later files read. Adding a new JS file means
  adding it to `index.html` **and** to `sw.js`'s `STATIC_FILES`, in the right order.
- **`chapters` array in `js/chapter.js` is the master registry** — it maps chapter
  ids and section dividers to `content/*.md` files. Routing, the sidebar, and
  cache-warming all derive from it.
- **Routing** is hash-based in `js/init.js` (`routeFromHash`): `#<md-filename-without-ext>`
  loads a chapter; `#dashboard`, `#dsa-practice`, `#dsa-problem-<id>`, `#mock-test`,
  `#goals`, `#motivation` are special pages.
- **Content** is plain Markdown fetched at runtime and rendered client-side with
  **marked.js**; math via **KaTeX**, code via **highlight.js**. Heavy libs
  (**Chart.js**, **mermaid**, **pyodide** for `.ipynb` chapters) are **lazy-loaded
  on demand** from CDNs, not in the initial `<script>` list.
- **Data files** in `js/data/`: `quizzes.js` (`QUIZ_DATA`), `mock_questions.js`
  (`MOCK_DATA`, generated), and the split DSA pair. DSA starter code is split out
  so it can be lazy-loaded on first problem open.
- **State** lives entirely in `localStorage`, namespaced with the **`ml4-`** prefix
  (`ml4-read`, `ml4-xp`, `ml4-theme`, …). `state.js` runs one-time **migrations**
  keyed by `ml4-migration-*` — when renaming/renumbering chapters, follow the
  existing migration pattern instead of breaking saved progress.
- **PWA:** `sw.js` precaches all assets and has a `CACHE_NAME` version string
  (e.g. `ml-notes-v219`). The app force-checks for SW updates on every load.

## Conventions & gotchas

- **Adding or renaming a chapter touches several files together:** the `chapters`
  array (`js/chapter.js`), `STATIC_FILES` in `sw.js`, the TOC table in `README.md`,
  and the `CHAPTER_MINUTES` list in `js/state.js` (then run
  `tools/update-reading-times.js`). Add quiz/mock content via `quizzes.js` and a
  `tools/mock_gen/` fragment.
- **Bump `CACHE_NAME` in `sw.js`** whenever you change shipped assets, or users
  get stale cached files after deploy.
- **Never hand-edit generated files:** `mock_questions.js`, the `dsa_problems_*`
  split pair, and the `CHAPTER_MINUTES` marker block. Edit the source and re-run
  the matching tool.
- **DSA Java starter code must contain no backticks** — `split-dsa.js` relies on
  backtick-delimited `starterCode` blocks. Edit `js/data/dsa_problems.js` (the
  unsplit source), then re-run the split tool.
- **Filenames keep the numbered prefix** (`00_`, `01_`, …) under `content/`.
- **Content style:** lead with a plain-language "Simple Explanation", then a formal
  "Official Definition" (blockquote). Use ASCII-art diagrams and tables — do **not**
  replace them with image links. Java and Python code blocks are runnable examples.
- No automated tests — verify web changes by opening `index.html` in a browser.

## Deploy

- **Web:** push to `main` → `.github/workflows/deploy.yml` publishes to GitHub Pages.
- **Desktop:** push a tag `desktop-v*` → `.github/workflows/release-desktop.yml`
  builds the Windows app and publishes a GitHub Release.

> Note: `CLAUDE.md` exists but is partly out of date (it predates the current
> 34-chapter renumbering). Prefer the `chapters` array in `js/chapter.js` and
> `README.md` as the source of truth for current structure.
