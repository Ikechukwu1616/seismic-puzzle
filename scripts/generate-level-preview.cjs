// Regenerates LEVEL_PREVIEW.md from src/data/levels.js so you can always
// see every level's character name lined up against its actual image.
// Run with: node scripts/generate-level-preview.cjs

const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '..', 'src', 'data', 'levels.js');
const src = fs.readFileSync(levelsPath, 'utf8');

const pattern = /\{ id: (\d+), name: '([^']*)', character: '([^']*)', image: '([^']*)'/g;
const rows = [...src.matchAll(pattern)];

const lines = [];
lines.push('# SEISMIC Puzzle, Level Preview');
lines.push('');
lines.push('Auto-generated from `src/data/levels.js`. Open this file in VS Code and press');
lines.push('`Ctrl+Shift+V` (Mac: `Cmd+Shift+V`) to preview it with images, that\'s the fastest');
lines.push('way to eyeball every level/character/image match at once.');
lines.push('');
lines.push('Regenerate any time with: `node scripts/generate-level-preview.cjs`');
lines.push('');
lines.push('| # | Character | File | Preview |');
lines.push('|---|---|---|---|');

for (const [, id, , character, image] of rows) {
  const filename = image.split('/').pop();
  const imgPath = `public${image}`;
  lines.push(`| ${id} | ${character} | \`${filename}\` | ![${character}](${imgPath}) |`);
}

const outPath = path.join(__dirname, '..', 'LEVEL_PREVIEW.md');
fs.writeFileSync(outPath, lines.join('\n') + '\n');
console.log(`wrote LEVEL_PREVIEW.md with ${rows.length} levels`);
