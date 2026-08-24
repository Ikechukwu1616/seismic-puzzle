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

const RAW_LEVELS = [
  { id: 1, name: 'First Tremor', character: 'Xealist', image: '/characters/xealist.jpg', rows: 2, cols: 3, difficulty: 1 },
  { id: 2, name: 'Aftershock', character: 'Noxx', image: '/characters/noxx.jpg', rows: 2, cols: 4, difficulty: 1 },
  { id: 3, name: 'Fault Line', character: 'Rocky', image: '/characters/rocky.jpg', rows: 2, cols: 5, difficulty: 2 },
  { id: 4, name: 'Deep Rupture', character: 'Lyron', image: '/characters/lyron.jpg', rows: 3, cols: 4, difficulty: 2 },
  { id: 5, name: 'Epicenter', character: 'Seismic Quiz', image: '/characters/quiz.jpg', rows: 3, cols: 5, difficulty: 3 },
];

export const LEVELS = RAW_LEVELS.map(buildLevel);

export function getLevel(id) {
  return LEVELS.find((l) => l.id === id) || null;
}

export function getNextLevelId(id) {
  const idx = LEVELS.findIndex((l) => l.id === id);
  if (idx === -1 || idx === LEVELS.length - 1) return null;
  return LEVELS[idx + 1].id;
}

export const TOTAL_LEVELS = LEVELS.length;
