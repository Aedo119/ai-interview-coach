export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>{current + 1} / {total}</span>
      <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
      </div>
      <span className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>{pct}%</span>
    </div>
  );
}
