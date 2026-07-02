import { useEffect, useRef } from 'react';

const DIMENSIONS = [
  { key: 'clarity',   label: 'Clarity'   },
  { key: 'relevance', label: 'Relevance' },
  { key: 'depth',     label: 'Depth'     },
  { key: 'structure', label: 'Structure' },
  { key: 'impact',    label: 'Impact'    },
];

// ── Radar Chart (SVG, no dependencies) ───────────────────────
function RadarChart({ scores }) {
  const size    = 200;
  const cx      = size / 2;
  const cy      = size / 2;
  const radius  = 75;
  const n       = DIMENSIONS.length;

  function polarToXY(angle, r) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  // Grid rings
  const rings = [2, 4, 6, 8, 10].map(v => {
    const pts = DIMENSIONS.map((_, i) => {
      const { x, y } = polarToXY((360 / n) * i, (v / 10) * radius);
      return `${x},${y}`;
    });
    return pts.join(' ');
  });

  // Score polygon
  const scorePts = DIMENSIONS.map((d, i) => {
    const val = scores?.[d.key] || 0;
    const { x, y } = polarToXY((360 / n) * i, (val / 10) * radius);
    return `${x},${y}`;
  });

  // Axis labels
  const labels = DIMENSIONS.map((d, i) => {
    const angle = (360 / n) * i;
    const { x, y } = polarToXY(angle, radius + 20);
    return { label: d.label, x, y };
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[200px] mx-auto">
      {/* Grid rings */}
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none"
          stroke="#334155" strokeWidth="0.5" />
      ))}
      {/* Axis lines */}
      {DIMENSIONS.map((_, i) => {
        const { x, y } = polarToXY((360 / n) * i, radius);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" strokeWidth="0.5" />;
      })}
      {/* Score fill */}
      <polygon points={scorePts.join(' ')}
        fill="#6470f3" fillOpacity="0.25"
        stroke="#6470f3" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Score dots */}
      {DIMENSIONS.map((d, i) => {
        const val = scores?.[d.key] || 0;
        const { x, y } = polarToXY((360 / n) * i, (val / 10) * radius);
        return <circle key={i} cx={x} cy={y} r="3" fill="#6470f3" />;
      })}
      {/* Labels */}
      {labels.map(({ label, x, y }) => (
        <text key={label} x={x} y={y}
          textAnchor="middle" dominantBaseline="middle"
          fontSize="9" fill="#94a3b8">
          {label}
        </text>
      ))}
    </svg>
  );
}

// ── Animated Bar Chart ────────────────────────────────────────
function BarChart({ scores }) {
  const barRefs = useRef([]);

  useEffect(() => {
    barRefs.current.forEach((el, i) => {
      if (!el) return;
      const dim = DIMENSIONS[i];
      const pct = ((scores?.[dim.key] || 0) / 10) * 100;
      setTimeout(() => {
        el.style.width = `${pct}%`;
      }, i * 80);
    });
  }, [scores]);

  return (
    <div className="space-y-3">
      {DIMENSIONS.map((d, i) => {
        const score = scores?.[d.key] || 0;
        const color = score >= 8 ? '#22c55e'
          : score >= 6 ? '#f59e0b'
          : score >= 4 ? '#f97316'
          : '#ef4444';
        return (
          <div key={d.key}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-400">{d.label}</span>
              <span className="text-xs font-mono font-semibold text-slate-300">{score}/10</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                ref={el => barRefs.current[i] = el}
                className="h-full rounded-full"
                style={{
                  width: '0%',
                  backgroundColor: color,
                  transition: `width 0.6s cubic-bezier(0.4,0,0.2,1) ${i * 80}ms`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Combined export ───────────────────────────────────────────
export default function ScoreChart({ scores }) {
  if (!scores) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-6 items-center">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Overview
          </p>
          <RadarChart scores={scores} />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Breakdown
          </p>
          <BarChart scores={scores} />
        </div>
      </div>
    </div>
  );
}
