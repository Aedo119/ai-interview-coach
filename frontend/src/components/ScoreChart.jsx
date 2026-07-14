import { useEffect, useRef } from 'react';

const DIMS = [
  { key: 'clarity',   label: 'Clarity'   },
  { key: 'relevance', label: 'Relevance' },
  { key: 'depth',     label: 'Depth'     },
  { key: 'structure', label: 'Structure' },
  { key: 'impact',    label: 'Impact'    },
];

// Helper to get CSS custom property values
function getCSSVar(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

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
  
  // Get computed CSS colors
  const borderColor = getCSSVar('--border');
  const textMuted = getCSSVar('--text-muted');
  const accentColor = getCSSVar('--accent');
  
  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[180px] mx-auto">
      {rings.map((pts,i) => <polygon key={i} points={pts} fill="none" stroke={borderColor} strokeWidth="0.75" />)}
      {DIMS.map((_,i) => { const {x,y} = toXY(360/n*i, r); return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={borderColor} strokeWidth="0.75" />; })}
      <polygon points={scorePts.join(' ')} fill={accentColor} fillOpacity="0.15" stroke={accentColor} strokeWidth="1.5" strokeLinejoin="round" />
      {DIMS.map((d,i) => { const {x,y} = toXY(360/n*i, (scores?.[d.key]||0)/10*r); return <circle key={i} cx={x} cy={y} r="3" fill={accentColor} />; })}
      {labels.map(({label,x,y}) => (
        <text key={label} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="8.5" fill={textMuted}>{label}</text>
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
  
  // Get computed CSS color
  const borderColor = getCSSVar('--border');
  const textMuted = getCSSVar('--text-muted');
  const textColor = getCSSVar('--text');
  
  return (
    <div className="space-y-3">
      {DIMS.map((d, i) => {
        const v = scores?.[d.key] || 0;
        const c = v >= 8 ? '#10b981' : v >= 6 ? '#f59e0b' : v >= 4 ? '#f97316' : '#ef4444';
        return (
          <div key={d.key}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: textMuted }}>{d.label}</span>
              <span className="text-xs font-mono font-semibold" style={{ color: textColor }}>{v}/10</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: borderColor }}>
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
  
  // Get computed CSS color
  const textSubtle = getCSSVar('--text-subtle');
  
  return (
    <div className="grid grid-cols-2 gap-6 items-center">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: textSubtle }}>Overview</p>
        <RadarChart scores={scores} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: textSubtle }}>Breakdown</p>
        <BarChart scores={scores} />
      </div>
    </div>
  );
}
