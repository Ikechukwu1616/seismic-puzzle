export default function ProgressBar({ placed, total }) {
  const pct = total > 0 ? (placed / total) * 100 : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="progress-label">{placed} / {total} PIECES</div>
    </div>
  );
}
