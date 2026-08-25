// SEISMIC level data. Each level cuts one character image into a grid of
// real interlocking jigsaw pieces (see src/utils/puzzleShapes.js). Add a
// level by adding one object here with an image, a grid size, and a name.

import { buildJigsawPieces } from '../utils/puzzleShapes';

function scatterPosition(i, total) {
  const edge = i % 4; // 0 top, 1 right, 2 bottom, 3 left
  const lane = Math.floor(i / 4);
  const t = total <= 4 ? 0.5 : (lane + 1) / (Math.ceil(total / 4) + 1);
  const along = 8 + t * 84;
  const margin = 8 + (lane % 2) * 6;
  switch (edge) {
    case 0: return { x: along, y: margin };
    case 1: return { x: 100 - margin, y: along };
    case 2: return { x: along, y: 100 - margin };
    default: return { x: margin, y: along };
  }
}

function buildLevel({ id, name, character, image, rows, cols, difficulty }) {
  const { pieces } = buildJigsawPieces(rows, cols, id * 7919 + rows * 31 + cols);
  return {
    id,
    name,
    character,
    image,
    rows,
    cols,
    difficulty,
    pieces: pieces.map((p, i) => ({ ...p, scatter: scatterPosition(i, pieces.length) })),
  };
}

// Levels past the first five auto-scale their grid size instead of being
// hand-tuned one by one. Difficulty ramps steadily: 20 pieces early on,
// then 25, then 30 for the back half of the roster.
function autoGrid(id) {
  if (id <= 9) return { rows: 4, cols: 5, difficulty: 2 };
  if (id <= 18) return { rows: 5, cols: 5, difficulty: 3 };
  return { rows: 5, cols: 6, difficulty: 3 };
}

function buildAutoLevel({ id, name, character, image }) {
  const { rows, cols, difficulty } = autoGrid(id);
  return buildLevel({ id, name, character, image, rows, cols, difficulty });
}

const RAW_LEVELS = [
  { id: 1, name: 'First Tremor', character: 'Xealist', image: '/characters/xealist.jpg', rows: 3, cols: 3, difficulty: 1 },
  { id: 2, name: 'Aftershock', character: 'Noxx', image: '/characters/noxx.jpg', rows: 3, cols: 4, difficulty: 1 },
  { id: 3, name: 'Fault Line', character: 'Rocky', image: '/characters/rocky.jpg', rows: 3, cols: 5, difficulty: 2 },
  { id: 4, name: 'Deep Rupture', character: 'Lyron', image: '/characters/lyron.jpg', rows: 4, cols: 4, difficulty: 2 },
  { id: 5, name: 'Epicenter', character: 'Seismic Quiz', image: '/characters/quiz.jpg', rows: 4, cols: 5, difficulty: 3 },
];

// Levels 6+ use buildAutoLevel: just give it an id, a name, a character,
// and the image path, the grid size and difficulty are derived automatically.
const AUTO_LEVELS = [
  { id: 6, name: 'Tremor Six', character: 'K2s', image: '/characters/k2s.jpg' },
  { id: 7, name: 'Tremor Seven', character: 'nguyentunek', image: '/characters/nguyentunek.jpg' },
  { id: 8, name: 'Tremor Eight', character: 'Origin', image: '/characters/origin.jpg' },
  { id: 9, name: 'Tremor Nine', character: 'Shroomy', image: '/characters/shroomy.jpg' },
  { id: 10, name: 'Tremor Ten', character: 'Tomjke', image: '/characters/tomjke.jpg' },
  { id: 11, name: 'Tremor Eleven', character: 'Zella', image: '/characters/zella.jpg' },
  { id: 12, name: 'Tremor Twelve', character: 'Xplanet', image: '/characters/xplanet.jpg' },
  { id: 13, name: 'Tremor Thirteen', character: 'Cigs', image: '/characters/cigs.jpg' },
  { id: 14, name: 'Tremor Fourteen', character: 'Adewale', image: '/characters/adewale.jpg' },
  { id: 15, name: 'Tremor Fifteen', character: 'MaryClaire', image: '/characters/maryclaire.jpg' },
  { id: 16, name: 'Tremor Sixteen', character: 'Guynextdoor', image: '/characters/guynextdoor.jpg' },
  { id: 17, name: 'Tremor Seventeen', character: 'Imani', image: '/characters/imani.jpg' },
  { id: 18, name: 'Tremor Eighteen', character: 'Vintage', image: '/characters/vintage.jpg' },
  { id: 19, name: 'Tremor Nineteen', character: 'Elixir', image: '/characters/elixir.jpg' },
  { id: 20, name: 'Tremor Twenty', character: 'Xeno', image: '/characters/xeno.jpg' },
  { id: 21, name: 'Tremor Twenty-One', character: 'Crimson', image: '/characters/crimson.jpg' },
  { id: 22, name: 'Tremor Twenty-Two', character: 'Fisayomi', image: '/characters/fisayomi.jpg' },
  { id: 23, name: 'Tremor Twenty-Three', character: 'Raya', image: '/characters/raya.jpg' },
  { id: 24, name: 'Tremor Twenty-Four', character: 'Sage', image: '/characters/sage.jpg' },
  { id: 25, name: 'Tremor Twenty-Five', character: 'Tobi', image: '/characters/tobi.jpg' },
  { id: 26, name: 'Tremor Twenty-Six', character: 'Ness', image: '/characters/ness.jpg' },
  { id: 27, name: 'Tremor Twenty-Seven', character: 'Ser David', image: '/characters/ser-david.jpg' },
  { id: 28, name: 'Tremor Twenty-Eight', character: 'Micheal', image: '/characters/micheal.jpg' },
  { id: 29, name: 'Tremor Twenty-Nine', character: 'Dee Figure', image: '/characters/dee-figure.jpg' },
  { id: 30, name: 'Tremor Thirty', character: 'Revv', image: '/characters/revv.jpg' },
  { id: 31, name: 'Tremor Thirty-One', character: 'Ruze', image: '/characters/ruze.jpg' },
  { id: 32, name: 'Tremor Thirty-Two', character: 'Dotman', image: '/characters/dotman.jpg' },
  { id: 33, name: 'Tremor Thirty-Three', character: 'ChainEmpress', image: '/characters/chainempress.jpg' },
  { id: 34, name: 'Tremor Thirty-Four', character: 'Lola', image: '/characters/lola.jpg' },
  { id: 35, name: 'Final Epicenter', character: 'Dav Walker', image: '/characters/dav-walker.jpg' },
];

export const LEVELS = [
  ...RAW_LEVELS.map(buildLevel),
  ...AUTO_LEVELS.map(buildAutoLevel),
];

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}

export function getNextLevelId(id) {
  const idx = LEVELS.findIndex((l) => l.id === id);
  if (idx === -1 || idx === LEVELS.length - 1) return null;
  return LEVELS[idx + 1].id;
}

export const TOTAL_LEVELS = LEVELS.length;

// Time limit scales with piece count so bigger puzzles stay hard but fair.
// Roughly 6 seconds per piece, floored at 3 minutes.
export function getTimeLimitMs(levelId) {
  const level = getLevel(levelId);
  const pieceCount = level ? level.pieces.length : 9;
  return Math.max(3 * 60 * 1000, pieceCount * 6 * 1000);
}
