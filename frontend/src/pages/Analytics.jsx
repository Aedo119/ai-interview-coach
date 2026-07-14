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

// Helper to get CSS custom property values
function getCSSVar(varName) {
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}

// ── Mini line chart (pure SVG) ────────────────────────────────
function LineChart({ data }) {
  if (!data?.length) return <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No data yet.</p>;

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
  
  // Get computed CSS colors
  const borderColor = getCSSVar('--border');
  const textSubtle = getCSSVar('--text-subtle');
  const accentColor = getCSSVar('--accent');
  const bgColor = getCSSVar('--bg');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* Grid */}
      {ticks.map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w - pad.r} y1={py(t)} y2={py(t)} stroke={borderColor} strokeWidth="1" />
          <text x={pad.l - 5} y={py(t) + 4} textAnchor="end" fontSize="9" fill={textSubtle}>{t}</text>
        </g>
      ))}
      {/* Area fill */}
      <path d={area} fill={accentColor} fillOpacity="0.1" />
      {/* Line */}
      <polyline points={points} fill="none" stroke={accentColor} strokeWidth="2" strokeLinejoin="round" />
      {/* Dots */}
      {data.map((d, i) => (
        <circle key={i} cx={px(i)} cy={py(d.overall_score)} r="3"
          fill={accentColor} stroke={bgColor} strokeWidth="1.5" />
      ))}
      {/* X axis labels */}
      {data.map((d, i) => {
        if (data.length > 10 && i % 3 !== 0) return null;
        return (
          <text key={i} x={px(i)} y={h - 8} textAnchor="middle" fontSize="8" fill={textSubtle}>
            {new Date(d.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </text>
        );
      })}
    </svg>
  );
}

// ── Category heatmap ──────────────────────────────────────────
function CategoryHeatmap({ data }) {
  if (!data?.length) return <p className="text-sm text-center py-8" style={{ color: 'var(--text-muted)' }}>No data yet.</p>;

  return (
    <div className="space-y-3">
      {data.map(row => {
        const score = parseInt(row.avg_score);
        const pct   = score;
        const color = score >= 75 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';
        const cat   = CATEGORY_LABELS[row.category] || { label: row.category, icon: '📋' };
        return (
          <div key={row.category}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{cat.icon} {cat.label}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-subtle)' }}>
                avg {score} · {row.attempts} attempt{row.attempts !== '1' ? 's' : ''}
              </span>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
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
        const color = score >= 8 ? '#10B981' : score >= 6 ? '#F59E0B' : '#EF4444';
        return (
          <div key={dim}>
            <div className="flex justify-between mb-1">
              <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{dim}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text)' }}>{score}/10</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
              <div className="h-full rounded-full" style={{ width: `${score * 10}%`, background: color, transition: 'width 0.7s ease' }} />
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
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Sign in to see your analytics</h2>
        <div className="flex gap-3 justify-center mt-4">
          <Link to="/login" className="btn btn-primary rounded-lg">Sign In</Link>
          <Link to="/register" className="btn btn-secondary rounded-lg">Sign Up</Link>
        </div>
      </div>
    </main>
  );

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
    </main>
  );

  const s = data?.summary;
  const noData = !s || parseInt(s.total_sessions) === 0;

  if (noData) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">📈</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>No data yet</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Complete some practice sessions and your analytics will appear here.</p>
        <Link to="/practice" className="btn btn-primary rounded-lg">Start Practicing →</Link>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-14 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8" style={{ color: 'var(--text)' }}>Your Analytics</h1>

        {error && <p className="text-sm mb-4" style={{ color: '#EF4444' }}>{error}</p>}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Sessions',    value: s.total_sessions },
            { label: 'Avg Score',   value: s.avg_score },
            { label: 'Best Score',  value: s.best_score },
            { label: 'Worst Score', value: s.worst_score },
          ].map(stat => (
            <div key={stat.label} className="card p-4 text-center" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value ?? '—'}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Score over time */}
          <div className="card p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>📈 Score Over Time</h3>
            <LineChart data={data?.scoreHistory} />
          </div>

          {/* Category heatmap */}
          <div className="card p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>🗺️ Performance by Category</h3>
            <CategoryHeatmap data={data?.categoryAvg} />
          </div>

          {/* Dimension averages */}
          <div className="card p-5 sm:col-span-2" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text)' }}>🎯 Average Dimension Scores</h3>
            <div className="max-w-lg">
              <DimensionBars data={data?.dimensionAvg} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
