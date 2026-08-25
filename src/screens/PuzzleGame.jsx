import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProgressBar from '../components/ProgressBar';
import PuzzlePiece from '../components/PuzzlePiece';
import PauseMenu from './PauseMenu';
import Settings from './Settings';
import { getLevel, getNextLevelId, getTimeLimitMs } from '../data/levels';


function initPieces(level) {
  return level.pieces.map((p) => ({
    ...p,
    x: p.scatter.x,
    y: p.scatter.y,
    locked: false,
  }));
}

export default function PuzzleGame({
  levelId, onExit, onComplete, onGameOver,
  gameSettings, onUpdateSettings, onResetProgressRequest, sfx,
}) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const TIME_LIMIT_MS = useMemo(() => getTimeLimitMs(levelId), [levelId]);
  const [pieces, setPieces] = useState(() => initPieces(level));
  const [draggingId, setDraggingId] = useState(null);
  const [justLocked, setJustLocked] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
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
  const triedOnceRef = useRef({});
  const finishedRef = useRef(false);
  const timedOutRef = useRef(false);

  const cellW = level.pieces[0].cellWidth;
  const cellH = level.pieces[0].cellHeight;
  // Very forgiving snap zone: half the cell in each direction. Enough that
  // if the piece looks anywhere close to right, it locks.
  const snapToleranceX = cellW * 0.5;
  const snapToleranceY = cellH * 0.5;

  const lockedCount = pieces.filter((p) => p.locked).length;
  const lockedCountRef = useRef(lockedCount);
  useEffect(() => { lockedCountRef.current = lockedCount; }, [lockedCount]);

  const resetLevel = useCallback(() => {
    setPieces(initPieces(level));
    setMoves(0);
    setCorrectFirstTry(0);
    triedOnceRef.current = {};
    setHintsUsed(0);
    setHintPieceId(null);
    setJustLocked(new Set());
    setPaused(false);
    setElapsedMs(0);
    setFinished(false);
    finishedRef.current = false;
    timedOutRef.current = false;
    startTimeRef.current = Date.now();
    pausedAccumRef.current = 0;
    pauseStartRef.current = null;
  }, [level]);

  useEffect(() => { resetLevel(); }, [levelId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Timer + countdown
  useEffect(() => {
    if (paused || finished) return;
    const id = setInterval(() => {
      const el = Date.now() - startTimeRef.current - pausedAccumRef.current;
      setElapsedMs(el);
      if (!timedOutRef.current && !finishedRef.current && el >= TIME_LIMIT_MS) {
        // Guard against the puzzle actually being complete already (e.g. the
        // last piece locked the same instant the clock hit zero). If every
        // piece is locked, this is a win, not a timeout, don't fail it.
        const allLocked = lockedCountRef.current === pieces.length && pieces.length > 0;
        if (allLocked) return;

        timedOutRef.current = true;
        finishedRef.current = true;
        setFinished(true);
        sfx.wrong();
        setTimeout(() => onGameOver(level.id), 400);
      }
    }, 250);
    return () => clearInterval(id);
  }, [paused, finished, level.id, onGameOver, sfx, TIME_LIMIT_MS, pieces.length]);

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      if (next) pauseStartRef.current = Date.now();
      else if (pauseStartRef.current) {
        pausedAccumRef.current += Date.now() - pauseStartRef.current;
      }
      return next;
    });
  }, []);

  const clampPct = (v) => Math.max(2, Math.min(98, v));

  const finishGame = useCallback((finalPieces) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setFinished(true);
    sfx.complete();
    const accuracy = Math.round((correctFirstTry / finalPieces.length) * 100);
    const nextLevelId = getNextLevelId(level.id);
    const timeMs = Date.now() - startTimeRef.current - pausedAccumRef.current;
    setTimeout(() => {
      onComplete(level.id, nextLevelId, { timeMs, moves, accuracy, hintsUsed });
    }, 700);
  }, [correctFirstTry, level.id, moves, hintsUsed, onComplete, sfx]);

  // IMPORTANT: React state updates are asynchronous. Do not try to decide
  // whether the puzzle is complete using a local variable inside setPieces().
  // Wait for the committed pieces state, then advance exactly once.
  useEffect(() => {
    if (finishedRef.current || timedOutRef.current) return;
    if (pieces.length === 0 || lockedCount !== pieces.length) return;
    finishGame(pieces);
  }, [pieces, lockedCount, finishGame]);

  const handlePointerDown = (e, pieceId) => {
    if (paused || finishedRef.current) return;
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
        const wasFirstTry = !triedOnceRef.current[draggingId];
        triedOnceRef.current[draggingId] = true;

        const snapped = dx <= snapToleranceX && dy <= snapToleranceY;

        if (snapped) {
          sfx.place();
          if (wasFirstTry) setCorrectFirstTry((c) => c + 1);
          const lockedId = draggingId;
          setJustLocked((prevSet) => new Set(prevSet).add(lockedId));
          setTimeout(() => {
            setJustLocked((prevSet) => {
              const next = new Set(prevSet);
              next.delete(lockedId);
              return next;
            });
          }, 500);
          const next = prev.map((p) =>
            p.id === draggingId
              ? { ...p, x: p.target.x, y: p.target.y, locked: true }
              : p
          );
          return next;
        }

        sfx.wrong();
        return prev.map((p) => (p.id === draggingId ? { ...p, locked: false } : p));
      });

      setDraggingId(null);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [draggingId, sfx, snapToleranceX, snapToleranceY, finishGame]);

  const useHint = () => {
    if (paused || finishedRef.current) return;
    const unplaced = pieces.filter((p) => !p.locked);
    if (unplaced.length === 0) return;
    const target = unplaced[0];
    setHintPieceId(target.id);
    setHintsUsed((h) => h + 1);
    sfx.click();
    setTimeout(() => setHintPieceId(null), 1200);
  };

  const remainingMs = Math.max(0, TIME_LIMIT_MS - elapsedMs);
  const remSec = Math.floor(remainingMs / 1000);
  const timeLabel = `${String(Math.floor(remSec / 60)).padStart(2, '0')}:${String(remSec % 60).padStart(2, '0')}`;
  const warning = remainingMs <= 30 * 1000 && remainingMs > 0;
  const timerColor = remainingMs === 0 ? 'var(--danger)' : warning ? 'var(--energy)' : undefined;

  return (
    <div className="screen" style={{ justifyContent: 'flex-start', paddingTop: 20 }}>
      <div className="game-header">
        <button className="btn-icon" onClick={() => { sfx.click(); togglePause(); }} aria-label="Pause">⏸</button>
        <ProgressBar placed={lockedCount} total={pieces.length} />
        <span
          className="timer-badge"
          style={{ color: timerColor, borderColor: warning ? 'var(--energy)' : undefined }}
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
        <span className="small-note">PLACED: {lockedCount}/{pieces.length}, MOVES: {moves}</span>
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
