// Builds real interlocking jigsaw piece shapes for a rows x cols grid cut
// from one image. Everything here is deterministic (seeded by level id) so
// the same level always produces the same piece shapes.

function mulberry32(seed) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// One shared sign per interior edge. vEdge[r][c] sits between piece (r,c)
// and piece (r,c+1). hEdge[r][c] sits between piece (r,c) and piece (r+1,c).
function buildEdgeSigns(rows, cols, seed) {
  const rand = mulberry32(seed);
  const vEdge = Array.from({ length: rows }, () =>
    Array.from({ length: cols - 1 }, () => (rand() < 0.5 ? -1 : 1))
  );
  const hEdge = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => (rand() < 0.5 ? -1 : 1))
  );
  return { vEdge, hEdge };
}

// One tab traced as a short polyline, t = position along the edge (0-1),
// b = perpendicular bulge as a multiple of the padding depth.
const TAB_POINTS = [
  [0, 0],
  [0.34, 0],
  [0.34, 0.85],
  [0.42, 1.15],
  [0.5, 1.25],
  [0.58, 1.15],
  [0.66, 0.85],
  [0.66, 0],
  [1, 0],
];

function tracePoints(sign) {
  if (sign === 0) return [[0, 0], [1, 0]];
  return TAB_POINTS.map(([t, b]) => [t, b * sign]);
}

// Returns an array of [xFrac, yFrac] points (0-1, relative to the piece's
// own padded bounding box) describing the piece silhouette, clockwise.
function buildPiecePath(row, col, rows, cols, vEdge, hEdge, insetX, insetY) {
  const pts = [];
  const push = (x, y) => pts.push([x, y]);

  // top
  const topSign = row === 0 ? 0 : -hEdge[row - 1][col];
  for (const [t, b] of tracePoints(topSign)) {
    push(insetX + t * (1 - 2 * insetX), insetY * (1 - b));
  }
  // right
  const rightSign = col === cols - 1 ? 0 : vEdge[row][col];
  for (const [t, b] of tracePoints(rightSign)) {
    push(1 - insetX + b * insetX, insetY + t * (1 - 2 * insetY));
  }
  // bottom
  const bottomSign = row === rows - 1 ? 0 : hEdge[row][col];
  for (const [t, b] of tracePoints(bottomSign)) {
    push(1 - insetX - t * (1 - 2 * insetX), 1 - insetY + b * insetY);
  }
  // left
  const leftSign = col === 0 ? 0 : -vEdge[row][col - 1];
  for (const [t, b] of tracePoints(leftSign)) {
    push(insetX - b * insetX, 1 - insetY - t * (1 - 2 * insetY));
  }

  return pts;
}

// Builds full geometry for every piece of a rows x cols image cut, using
// stage-relative percentages throughout so it works at any screen size.
export function buildJigsawPieces(rows, cols, seed) {
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  const pad = Math.min(cellW, cellH) * 0.26;
  const boxW = cellW + pad * 2;
  const boxH = cellH + pad * 2;
  const insetX = pad / boxW;
  const insetY = pad / boxH;

  const { vEdge, hEdge } = buildEdgeSigns(rows, cols, seed);

  const pieces = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const boxLeft = col * cellW - pad;
      const boxTop = row * cellH - pad;
      const path = buildPiecePath(row, col, rows, cols, vEdge, hEdge, insetX, insetY);
      const points = path.map(([x, y]) => [Number((x * 100).toFixed(2)), Number((y * 100).toFixed(2))]);

      pieces.push({
        id: `r${row}c${col}`,
        row,
        col,
        width: boxW,
        height: boxH,
        cellWidth: cellW,
        cellHeight: cellH,
        target: {
          x: col * cellW + cellW / 2,
          y: row * cellH + cellH / 2,
        },
        points,
        // the full image, expressed as a size/position relative to THIS piece's own box
        imgWidthPct: (100 / boxW) * 100,
        imgHeightPct: (100 / boxH) * 100,
        imgLeftPct: -(boxLeft / boxW) * 100,
        imgTopPct: -(boxTop / boxH) * 100,
      });
    }
  }
  return { pieces, cellW, cellH };
}
