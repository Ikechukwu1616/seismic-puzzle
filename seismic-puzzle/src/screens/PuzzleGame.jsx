import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import PuzzlePiece from '../components/PuzzlePiece';
import PauseMenu from './PauseMenu';
import Settings from './Settings';
import { getLevel, getNextLevelId } from '../data/levels';

function initPieces(level) {
  return level.pieces.map((p) => ({
    ...p,
    x: p.scatter.x,
    y: p.scatter.y,
    locked: false,
  }));
}

export default function PuzzleGame({ levelId, onExit, onComplete, gameSettings, onUpdateSettings, onResetProgressRequest, sfx }) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const [pieces, setPieces] = useState(() => initPieces(level));
  const [draggingId, setDraggingId] = useState(null);
  const [justLocked, setJustLocked] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [triedOnce, setTriedOnce] = useState({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintPieceId, setHintPieceId] = useState(null);
  const [paused, setPaused] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finished, setFinished] = useState(false);

  const stageRef = useRef(null);
  const dragOffset = useRef({ dx: 0, dy: 0 });
  const startTimeRef = useRef(Date.now());
  const pausedAccumRef = useRef(0);
  const pauseStartRef = useRef(null);

  const lockedCount = pieces.filter((p) => p.locked).length;
  const cellW = level.pieces[0].cellWidth;
  const cellH = level.pieces[0].cellHeight;
  const snapToleranceX = cellW * 0.62;
  const snapToleranceY = cellH * 0.62;
  const TIME_LIMIT_MS = 3 * 60 * 1000;

  // Reset everything when the level changes (new play or restart)
  const resetLevel = useCallback(() => {
    setPieces(initPieces(level));
    setMoves(0);
    setCorrectFirstTry(0);
    setTriedOnce({});
    setHintsUsed(0);
    setHintPieceId(null);
    setJustLocked(new Set());
    setPaused(false);
    setElapsedMs(0);
    setFinished(false);
    startTimeRef.current = Date.now();
    pausedAccumRef.current = 0;
    pauseStartRef.current = null;
  }, [level]);

  useEffect(() => { resetLevel(); }, [levelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer
  useEffect(() => {
    if (paused || finished) return;
    const id = setInterval(() => {
      setElapsedMs(Date.now() - startTimeRef.current - pausedAccumRef.current);
    }, 250);
    return () => clearInterval(id);
  }, [paused, finished]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      if (next) {
        pauseStartRef.current = Date.now();
      } else if (pauseStartRef.current) {
        pausedAccumRef.current += Date.now() - pauseStartRef.current;
      }
      return next;
    });
  }, []);

  const clampPct = (v) => Math.max(2, Math.min(98, v));

  const handlePointerDown = (e, pieceId) => {
    if (paused || finished) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const piece = pieces.find((p) => p.id === pieceId);
    const pieceCx = rect.left + (piece.x / 100) * rect.width;
    const pieceCy = rect.top + (piece.y / 100) * rect.height;
    dragOffset.current = { dx: e.clientX - pieceCx, dy: e.clientY - pieceCy };
    setDraggingId(pieceId);
    sfx.pickup();
    e.target.setPointerCapture?.(e.pointerId);
  };

  useEffect(() => {
    if (!draggingId) return;

    const onMove = (e) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      const px = e.clientX - dragOffset.current.dx;
      const py = e.clientY - dragOffset.current.dy;
      const xPct = clampPct(((px - rect.left) / rect.width) * 100);
      const yPct = clampPct(((py - rect.top) / rect.height) * 100);
      setPieces((prev) => prev.map((p) => (p.id === draggingId ? { ...p, x: xPct, y: yPct } : p)));
    };

    const onUp = () => {
      setPieces((prev) => {
        const piece = prev.find((p) => p.id === draggingId);
        if (!piece) return prev;
        const dx = Math.abs(piece.x - piece.target.x);
        const dy = Math.abs(piece.y - piece.target.y);
        setMoves((m) => m + 1);
        setTriedOnce((t) => ({ ...t, [draggingId]: true }));

        if (dx <= snapToleranceX && dy <= snapToleranceY) {
          sfx.place();
          if (!triedOnce[draggingId]) {
            setCorrectFirstTry((c) => c + 1);
          }
          const lockedId = draggingId;
          setJustLocked((prevSet) => new Set(prevSet).add(lockedId));
          setTimeout(() => {
            setJustLocked((prevSet) => {
              const next = new Set(prevSet);
              next.delete(lockedId);
              return next;
            });
          }, 500);
          return prev.map((p) =>
            p.id === draggingId ? { ...p, x: p.target.x, y: p.target.y, locked: true } : p
          );
        }
        sfx.wrong();
        return prev.map((p) => (p.id === draggingId ? { ...p, locked: false } : p));
      });
      setDraggingId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [draggingId, sfx, triedOnce, snapToleranceX, snapToleranceY]);

  // Completion check
  useEffect(() => {
    if (finished) return;
    if (pieces.length > 0 && pieces.every((p) => p.locked)) {
      setFinished(true);
      sfx.complete();
      const accuracy = Math.round((correctFirstTry / pieces.length) * 100);
      const nextLevelId = getNextLevelId(level.id);
      const timer = setTimeout(() => {
        onComplete(level.id, nextLevelId, {
          timeMs: Date.now() - startTimeRef.current - pausedAccumRef.current,
          moves,
          accuracy,
          hintsUsed,
        });
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [pieces, finished, level.id, moves, hintsUsed, correctFirstTry, onComplete, sfx]);

  const useHint = () => {
    if (paused || finished) return;
    const unplaced = pieces.filter((p) => !p.locked);
    if (unplaced.length === 0) return;
    const target = unplaced[0];
    setHintPieceId(target.id);
    setHintsUsed((h) => h + 1);
    sfx.click();
    setTimeout(() => setHintPieceId(null), 1200);
  };

  const remainingMs = TIME_LIMIT_MS - elapsedMs;
  const overtime = remainingMs < 0;
  const displaySeconds = Math.floor(Math.abs(remainingMs) / 1000);
  const timeLabel = `${overtime ? '+' : ''}${String(Math.floor(displaySeconds / 60)).padStart(2, '0')}:${String(displaySeconds % 60).padStart(2, '0')}`;

  return (
    <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 20 }}>
      <div className="game-header">
        <button className="btn-icon" onClick={() => { sfx.click(); togglePause(); }} aria-label="Pause">
          ⏸
        </button>
        <ProgressBar placed={lockedCount} total={pieces.length} />
        <span
          className="small-note"
          style={{ fontSize: 13, minWidth: 48, textAlign: 'right', color: overtime ? 'var(--danger)' : undefined }}
        >
          {timeLabel}
        </span>
      </div>

      <div className="eyebrow" style={{ marginBottom: 10 }}>
        Level {String(level.id).padStart(2, '0')}, {level.character}
      </div>

      <div className="puzzle-stage-wrap">
        <div className="char-preview">
          <img src={level.image} alt={level.character} />
          <span className="preview-label">{level.character}</span>
        </div>
        <div className="puzzle-stage" ref={stageRef}>
          {pieces.map((p) => (
            <div
              key={`ghost-${p.id}`}
              className={`target-ghost${hintPieceId === p.id ? ' hinted' : ''}`}
              style={{
                left: `${p.target.x}%`,
                top: `${p.target.y}%`,
                width: `${p.cellWidth}%`,
                height: `${p.cellHeight}%`,
                opacity: p.locked ? 0 : 1,
              }}
            />
          ))}
          {pieces.map((p) => (
            <PuzzlePiece
              key={p.id}
              piece={p}
              image={level.image}
              posX={p.x}
              posY={p.y}
              locked={p.locked}
              dragging={draggingId === p.id}
              onPointerDown={handlePointerDown}
              showHint={hintPieceId === p.id}
              justLocked={justLocked.has(p.id)}
            />
          ))}
        </div>
      </div>

      <div className="piece-tray">
        <span className="small-note">MOVES: {moves}, HINTS: {hintsUsed}</span>
        <div className="hud-btns">
          <button className="btn btn-secondary" onClick={useHint} disabled={paused || finished}>Hint</button>
          <button className="btn btn-ghost" onClick={() => { sfx.click(); resetLevel(); }}>Restart</button>
        </div>
      </div>

      {paused && !settingsOpen && (
        <PauseMenu
          onResume={togglePause}
          onRestart={() => { resetLevel(); }}
          onExit={onExit}
          onSettings={() => setSettingsOpen(true)}
          sfx={sfx}
        />
      )}

      {paused && settingsOpen && (
        <div className="overlay">
          <div className="card" style={{ width: '100%', maxWidth: 360, maxHeight: '80vh', overflowY: 'auto', padding: 20 }}>
            <Settings
              settings={gameSettings}
              onUpdate={onUpdateSettings}
              onBack={() => setSettingsOpen(false)}
              onResetProgress={onResetProgressRequest}
              sfx={sfx}
              embedded
            />
          </div>
        </div>
      )}
    </div>
  );
}
