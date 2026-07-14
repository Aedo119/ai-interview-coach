import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const CATEGORY_LABELS = {
  behavioral:    { label: 'Behavioral',    icon: '🧠' },
  technical:     { label: 'Technical',     icon: '💻' },
  'system-design': { label: 'System Design', icon: '🏗️' },
  situational:   { label: 'Situational',   icon: '⚡' },
  'culture-fit': { label: 'Culture Fit',   icon: '🤝' },
};

const DIMENSIONS = ['clarity', 'relevance', 'depth', 'structure', 'impact'];

// ── Mini line chart (pure SVG) ────────────────────────────────
function LineChart({ data }) {
  if (!data?.length) return <p className="text-slate-600 text-sm text-center py-8">No data yet.</p>;

  const w = 500, h = 160, pad = { t: 10, r: 10, b: 30, l: 30 };
  const iw = w - pad.l - pad.r;
  const ih = h - pad.t - pad.b;
  const scores = data.map(d => d.overall_score);
  const min = Math.max(0,  Math.min(...scores) - 10);
  const max = Math.min(100, Math.max(...scores) + 10);

  const px = (i) => pad.l + (i / (data.length - 1 || 1)) * iw;
  const py = (v) => pad.t + ih - ((v - min) / (max - min || 1)) * ih;

  const points = data.map((d, i) => `${px(i)},${py(d.overall_score)}`).join(' ');
  const area   = `M${px(0)},${py(data[0].overall_score)} ` +
    data.map((d, i) => `L${px(i)},${py(d.overall_score)}`).join(' ') +
    ` L${px(data.length - 1)},${pad.t + ih} L${px(0)},${pad.t + ih} Z`;

  // Y axis ticks
  const ticks = [min, (min + max) / 2, max].map(Math.round);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Grid */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={py(t)} y2={py(t)} stroke="#1e293b" strokeWidth="1" />
          <text x={pad.l - 5} y={py(t) + 4} textAnchor="end" fontSize="9" fill="#475569">{t}</text>
        </g>
      ))}
      {/* Area fill */}
      <path d={area} fill="#6470f3" fillOpacity="0.1" />
      {/* Line */}
      <polyline points={points} fill="none" stroke="#6470f3" strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.overall_score)} r="3"
          fill="#6470f3" stroke="#0f172a" strokeWidth="1.5" />
      ))}
      {/* X axis labels */}
      {data.map((d, i) => {
        if (data.length > 10 && i % 3 !== 0) return null;
        return (
          <text key={i} x={px(i)} y={h - 8} textAnchor="middle" fontSize="8" fill="#475569">
            {new Date(d.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

// ── Category heatmap ──────────────────────────────────────────
function CategoryHeatmap({ data }) {
  if (!data?.length) return <p className="text-slate-600 text-sm text-center py-8">No data yet.</p>;

  return (
    <div className="space-y-3">
      {data.map(row => {
        const score = parseInt(row.avg_score);
        const pct   = score;
        const color = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
        const cat   = CATEGORY_LABELS[row.category] || { label: row.category, icon: '📋' };
        return (
          <div key={row.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">{cat.icon} {cat.label}</span>
              <span className="text-xs text-slate-500 font-mono">
                avg {score} · {row.attempts} attempt{row.attempts !== '1' ? 's' : ''}
              </span>
            </div>
            <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full transition-all duration-700`}
                style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Dimension radar (reuse same SVG approach) ─────────────────
function DimensionBars({ data }) {
  if (!data) return null;
  return (
    <div className="space-y-3">
      {DIMENSIONS.map(dim => {
        const score = parseFloat(data[dim]) || 0;
        const color = score >= 8 ? 'bg-emerald-500' : score >= 6 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div key={dim}>
            <div className="flex justify-between mb-1">
              <span className="text-xs text-slate-400 capitalize">{dim}</span>
              <span className="text-xs font-mono text-slate-300">{score}/10</span>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${color} rounded-full`} style={{ width: `${score * 10}%`, transition: 'width 0.7s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const { isLoggedIn }          = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    api.getAnalytics()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  if (!isLoggedIn) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your analytics</h2>
        <div className="flex gap-3 justify-center mt-4">
          <Link to="/login"    className="btn-primary">Sign In</Link>
          <Link to="/register" className="btn-secondary">Sign Up</Link>
        </div>
      </div>
    </main>
  );

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );

  const s = data?.summary;
  const noData = !s || parseInt(s.total_sessions) === 0;

  if (noData) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">📈</div>
        <h2 className="text-xl font-semibold text-white mb-2">No data yet</h2>
        <p className="text-slate-500 mb-6">Complete some practice sessions and your analytics will appear here.</p>
        <Link to="/practice" className="btn-primary">Start Practicing →</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Your Analytics</h1>

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Sessions',    value: s.total_sessions },
            { label: 'Avg Score',   value: s.avg_score },
            { label: 'Best Score',  value: s.best_score },
            { label: 'Worst Score', value: s.worst_score },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center">
              <div className="text-2xl font-bold text-white">{stat.value ?? '—'}</div>
              <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Score over time */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">📈 Score Over Time</h3>
            <LineChart data={data?.scoreHistory} />
          </div>

          {/* Category heatmap */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🗺️ Performance by Category</h3>
            <CategoryHeatmap data={data?.categoryAvg} />
          </div>

          {/* Dimension averages */}
          <div className="card p-5 sm:col-span-2">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">🎯 Average Dimension Scores</h3>
            <div className="max-w-lg">
              <DimensionBars data={data?.dimensionAvg} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
