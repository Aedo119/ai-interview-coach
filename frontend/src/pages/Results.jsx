import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function ScorePill({ score }) {
  let bgColor, textColor;
  if (score >= 75) {
    bgColor = 'rgba(16, 185, 129, 0.1)';
    textColor = '#10B981';
  } else if (score >= 50) {
    bgColor = 'rgba(245, 158, 11, 0.1)';
    textColor = '#F59E0B';
  } else {
    bgColor = 'rgba(239, 68, 68, 0.1)';
    textColor = '#EF4444';
  }
  return <span className="badge font-mono font-semibold text-xs px-2 py-1" style={{ background: bgColor, color: textColor }}>{score}</span>;
}

function parseScores(scores) {
  if (!scores) return null;
  if (typeof scores === 'string') {
    try { return JSON.parse(scores); } catch { return null; }
  }
  return scores;
}

export default function Results() {
  const { isLoggedIn, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }

    // Directly fetch with token to rule out api.js issues
    const t = token || localStorage.getItem('token');
    fetch('/api/history', {
      headers: { Authorization: `Bearer ${t}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        console.log('History data:', data); // debug
        setSessions(data.sessions || []);
      })
      .catch(err => {
        console.error('History fetch error:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  async function handleDelete(id) {
    await api.deleteSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  }

  if (!isLoggedIn) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Sign in to see your history</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Your practice sessions are saved to your account.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login" className="btn btn-primary rounded-lg">Sign In</Link>
          <Link to="/register" className="btn btn-secondary rounded-lg">Create Account</Link>
        </div>
      </div>
    </main>
  );

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
    </main>
  );

  if (error) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Failed to load history</h2>
        <p className="text-sm mb-6" style={{ color: '#EF4444' }}>{error}</p>
        <Link to="/practice" className="btn btn-primary rounded-lg">Back to Practice</Link>
      </div>
    </main>
  );

  if (sessions.length === 0) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>No sessions yet</h2>
        <p className="mb-6" style={{ color: 'var(--text-muted)' }}>Complete a practice session and it'll appear here.</p>
        <Link to="/practice" className="btn btn-primary rounded-lg">Start Practicing →</Link>
      </div>
    </main>
  );

  const avgScore = Math.round(
    sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length
  );

  return (
    <main className="min-h-screen pt-14 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Practice History</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} · avg score{' '}
              <span className="font-mono" style={{ color: 'var(--text)' }}>{avgScore}</span>
            </p>
          </div>
          <Link to="/practice" className="btn btn-primary rounded-lg text-sm">+ New Question</Link>
        </div>

        <div className="space-y-4">
          {sessions.map(s => {
            const scores = parseScores(s.scores);
            const feedback = typeof s.feedback === 'string'
              ? (() => { try { return JSON.parse(s.feedback); } catch { return null; } })()
              : s.feedback;

            return (
              <div key={s.id} className="card p-5 transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>{s.question}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.overall_score && <ScorePill score={s.overall_score} />}
                    <button onClick={() => handleDelete(s.id)}
                      className="text-xs transition-colors" style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }} onMouseEnter={e => e.target.style.color = '#EF4444'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>✕</button>
                  </div>
                </div>

                <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--text-muted)' }}>{s.answer}</p>

                <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                  {s.category && (
                    <span className="badge text-xs px-2 py-1" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>✓ {s.category.charAt(0).toUpperCase() + s.category.slice(1)}</span>
                  )}
                  {scores && Object.entries(scores).map(([k, v]) => (
                    <span key={k} className="badge text-xs px-2 py-1" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                      {k} · <span style={{ color: 'var(--text)' }} className="font-mono">{v}/10</span>
                    </span>
                  ))}
                  <span className="badge text-xs px-2 py-1 ml-auto" style={{ background: 'var(--bg-subtle)', color: 'var(--text-subtle)' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>

                {feedback?.keyTakeaway && (
                  <p className="text-xs mt-3 flex items-start gap-1.5" style={{ color: 'var(--accent)' }}>
                    <span>💡</span>{feedback.keyTakeaway}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}