export default function PauseMenu({ onResume, onRestart, onExit, onSettings, sfx }) {
  const act = (fn) => { sfx.click(); fn(); };
  return (
    <div className="overlay">
      <div className="card overlay-panel fade-up">
        <span className="eyebrow">Paused</span>
        <button className="btn btn-primary btn-block" onClick={() => act(onResume)}>Resume</button>
        <button
          className="btn btn-secondary btn-block"
          onClick={() => { sfx.click(); onRestart(); }}
        >
          Restart Level
        </button>
        {onSettings && (
          <button className="btn btn-secondary btn-block" onClick={() => act(onSettings)}>Settings</button>
        )}
        <button className="btn btn-ghost btn-block" onClick={() => act(onExit)}>Exit to Menu</button>
      </div>
    </div>
  );
}
