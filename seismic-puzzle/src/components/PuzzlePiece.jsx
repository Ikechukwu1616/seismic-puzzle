import { useEffect, useRef, useId } from 'react';

export default function PuzzlePiece({
  piece,
  image,
  posX,
  posY,
  locked,
  dragging,
  onPointerDown,
  showHint,
  justLocked,
}) {
  const ref = useRef(null);
  const clipId = `clip-${useId()}-${piece.id}`;
  const pointsAttr = piece.points.map(([x, y]) => `${x},${y}`).join(' ');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prevent = (e) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    return () => el.removeEventListener('touchmove', prevent);
  }, []);

  return (
    <div
      ref={ref}
      className={`puzzle-piece${dragging ? ' dragging' : ''}${locked ? ' locked' : ''}${justLocked ? ' just-locked' : ''}`}
      style={{
        left: `${posX}%`,
        top: `${posY}%`,
        width: `${piece.width}%`,
        height: `${piece.height}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onPointerDown={(e) => onPointerDown(e, piece.id)}
      role="button"
      aria-label={`Puzzle piece${locked ? ', placed, can still be moved' : ''}`}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="piece-svg">
        <defs>
          <clipPath id={clipId}>
            <polygon points={pointsAttr} />
          </clipPath>
        </defs>
        <image
          href={image}
          x={piece.imgLeftPct}
          y={piece.imgTopPct}
          width={piece.imgWidthPct}
          height={piece.imgHeightPct}
          preserveAspectRatio="none"
          clipPath={`url(#${clipId})`}
        />
        <polygon
          points={pointsAttr}
          fill="none"
          stroke={showHint ? 'var(--energy)' : locked ? 'var(--fracture)' : 'rgba(244,241,247,0.85)'}
          strokeWidth={showHint ? 2.2 : locked ? 1.6 : 1.1}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
