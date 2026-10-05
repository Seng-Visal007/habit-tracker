// scripts/generate-icons.mjs
// Run: node scripts/generate-icons.mjs
// Requires: npm install -D sharp

import { createRequire } from 'module';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Try to use sharp; fall back to a pure-JS SVG approach
let sharp;
try {
  const require = createRequire(import.meta.url);
  sharp = require('sharp');
} catch {
  sharp = null;
}

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = join(root, 'public', 'icons');

mkdirSync(publicDir, { recursive: true });

if (sharp) {
  const source = join(root, 'scripts', 'icon-source.jpg');
  await Promise.all(
    sizes.map((size) =>
      sharp(source)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, `icon-${size}x${size}.png`))
        .then(() => console.log(`✓ icon-${size}x${size}.png`))
    )
  );
  // Also create maskable version (with safe-zone padding ~10%)
  await sharp(join(root, 'scripts', 'icon-source.jpg'))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'icon-maskable-512x512.png'));
  console.log('✓ icon-maskable-512x512.png');
  console.log('\n✅ All icons generated!');
} else {
  // Fallback: generate a placeholder SVG-based PNG via canvas-free approach
  console.log('sharp not found — generating SVG placeholders instead');
  for (const size of sizes) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0f1117"/>
  <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="none" stroke="#7c3aed" stroke-width="${size * 0.06}"/>
  <path d="M${size*0.32} ${size*0.5} L${size*0.45} ${size*0.63} L${size*0.68} ${size*0.37}" stroke="#7c3aed" stroke-width="${size*0.07}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
</svg>`;
    writeFileSync(join(publicDir, `icon-${size}x${size}.svg`), svg);
    console.log(`✓ icon-${size}x${size}.svg`);
  }
}
