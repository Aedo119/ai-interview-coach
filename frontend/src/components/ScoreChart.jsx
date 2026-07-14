import { useEffect, useRef } from 'react';

const DIMS = [
  { key: 'clarity',   label: 'Clarity'   },
  { key: 'relevance', label: 'Relevance' },
  { key: 'depth',     label: 'Depth'     },
  { key: 'structure', label: 'Structure' },
  { key: 'impact',    label: 'Impact'    },
];

function RadarChart({ scores }) {
  const size = 200, cx = 100, cy = 100, r = 72, n = DIMS.length;
  const toXY = (angle, radius) => ({
    x: cx + radius * Math.cos((angle - 90) * Math.PI / 180),
    y: cy + radius * Math.sin((angle - 90) * Math.PI / 180),
  });
  const rings = [2,4,6,8,10].map(v =>
    DIMS.map((_,i) => { const {x,y} = toXY(360/n*i, v/10*r); return `${x},${y}`; }).join(' ')
  );
  const scorePts = DIMS.map((d,i) => { const {x,y} = toXY(360/n*i, (scores?.[d.key]||0)/10*r); return `${x},${y}`; });
  const labels   = DIMS.map((d,i) => { const {x,y} = toXY(360/n*i, r+18); return { label: d.label, x, y }; });
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px] mx-auto">
      {rings.map((pts,i) => <polygon key={i} points={pts} fill="none" stroke="var(--border)" strokeWidth="0.75" />)}
      {DIMS.map((_,i) => { const {x,y} = toXY(360/n*i, r); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--border)" strokeWidth="0.75" />; })}
      <polygon points={scorePts.join(' ')} fill="var(--accent)" fillOpacity="0.15" stroke="var(--accent)" strokeWidth="1.5" strokeLinejoin="round" />
      {DIMS.map((d,i) => { const {x,y} = toXY(360/n*i, (scores?.[d.key]||0)/10*r); return <circle key={i} cx={x} cy={y} r="3" fill="var(--accent)" />; })}
      {labels.map(({label,x,y}) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill="var(--text-muted)">{label}</text>
      ))}
    </svg>
  );
}

function BarChart({ scores }) {
  const refs = useRef([]);
  useEffect(() => {
    refs.current.forEach((el, i) => {
      if (!el) return;
      const pct = ((scores?.[DIMS[i].key] || 0) / 10) * 100;
      setTimeout(() => { el.style.width = `${pct}%`; }, i * 70);
    });
  }, [scores]);
  return (
    <div className="space-y-3">
      {DIMS.map((d, i) => {
        const v = scores?.[d.key] || 0;
        const c = v >= 8 ? '#10b981' : v >= 6 ? '#f59e0b' : v >= 4 ? '#f97316' : '#ef4444';
        return (
          <div key={d.key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.label}</span>
              <span className="text-xs font-mono font-semibold" style={{ color: 'var(--text)' }}>{v}/10</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div ref={el => refs.current[i] = el} className="h-full rounded-full"
                style={{ width: '0%', backgroundColor: c, transition: `width 0.55s cubic-bezier(0.4,0,0.2,1) ${i*70}ms` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ScoreChart({ scores }) {
  if (!scores) return null;
  return (
    <div className="grid grid-cols-2 gap-6 items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Overview</p>
        <RadarChart scores={scores} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-subtle)' }}>Breakdown</p>
        <BarChart scores={scores} />
      </div>
    </div>
  );
}
