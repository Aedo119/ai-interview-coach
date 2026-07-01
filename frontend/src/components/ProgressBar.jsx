export default function ProgressBar({ current, total }) {
  const pct = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">
        {current + 1} / {total}
      </span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-500 font-mono whitespace-nowrap">{pct}%</span>
    </div>
  );
}
