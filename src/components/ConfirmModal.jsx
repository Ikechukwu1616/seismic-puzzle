export default function ConfirmModal({ title, body, confirmLabel = 'Confirm', onConfirm, onCancel, sfx }) {
  return (
    <div className="overlay">
      <div className="card overlay-panel fade-up">
        <span className="eyebrow">{title}</span>
        <p style={{ color: 'var(--ink-1)', textAlign: 'center', fontSize: 14, margin: '4px 0 8px' }}>{body}</p>
        <button className="btn btn-danger btn-block" onClick={() => { sfx.click(); onConfirm(); }}>{confirmLabel}</button>
        <button className="btn btn-ghost btn-block" onClick={() => { sfx.click(); onCancel(); }}>Cancel</button>
      </div>
    </div>
  );
}
