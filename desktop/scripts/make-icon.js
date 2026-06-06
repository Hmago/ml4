// Generates build/icon.ico from ../icon-512.svg.
// Run with: node scripts/make-icon.js
const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const pngToIco = require('png-to-ico').default;

async function main() {
  const svgPath = path.resolve(__dirname, '..', '..', 'icon-512.svg');
  const outDir = path.resolve(__dirname, '..', 'build');
  fs.mkdirSync(outDir, { recursive: true });

  if (!fs.existsSync(svgPath)) {
    throw new Error(`SVG not found: ${svgPath}`);
  }

  const svg = fs.readFileSync(svgPath);
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = [];
  for (const size of sizes) {
    const buf = await sharp(svg, { density: 384 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    pngBuffers.push(buf);
  }

  // 512 PNG for electron-builder fallback / future use.
  fs.writeFileSync(
    path.join(outDir, 'icon.png'),
    await sharp(svg, { density: 384 }).resize(512, 512).png().toBuffer(),
  );

  const icoBuffer = await pngToIco(pngBuffers);
  const icoPath = path.join(outDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Wrote ${icoPath} (${icoBuffer.length} bytes, ${sizes.length} sizes)`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
