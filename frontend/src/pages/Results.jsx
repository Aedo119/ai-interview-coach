import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function ScorePill({ score }) {
  const color = score >= 75 ? 'bg-emerald-500/20 text-emerald-400'
    : score >= 50 ? 'bg-amber-500/20 text-amber-400'
    : 'bg-red-500/20 text-red-400';
  return <span className={`badge ${color} font-mono font-semibold`}>{score}</span>;
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
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to see your history</h2>
        <p className="text-slate-500 mb-6">Your practice sessions are saved to your account.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/login"    className="btn-primary">Sign In</Link>
          <Link to="/register" className="btn-secondary">Create Account</Link>
        </div>
      </div>
    </main>
  );

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );

  if (error) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-white mb-2">Failed to load history</h2>
        <p className="text-red-400 text-sm mb-6">{error}</p>
        <Link to="/practice" className="btn-primary">Back to Practice</Link>
      </div>
    </main>
  );

  if (sessions.length === 0) return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-xl font-semibold text-white mb-2">No sessions yet</h2>
        <p className="text-slate-500 mb-6">Complete a practice session and it'll appear here.</p>
        <Link to="/practice" className="btn-primary">Start Practicing →</Link>
      </div>
    </main>
  );

  const avgScore = Math.round(
    sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length
  );

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Practice History</h1>
            <p className="text-sm text-slate-500 mt-1">
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} · avg score{' '}
              <span className="text-white font-mono">{avgScore}</span>
            </p>
          </div>
          <Link to="/practice" className="btn-primary text-sm">+ New Question</Link>
        </div>

        <div className="space-y-4">
          {sessions.map(s => {
            const scores = parseScores(s.scores);
            const feedback = typeof s.feedback === 'string'
              ? (() => { try { return JSON.parse(s.feedback); } catch { return null; } })()
              : s.feedback;

            return (
              <div key={s.id} className="card p-5 hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <p className="text-sm font-medium text-slate-200 leading-snug">{s.question}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.overall_score && <ScorePill score={s.overall_score} />}
                    <button onClick={() => handleDelete(s.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors text-xs">✕</button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 mb-3">{s.answer}</p>

                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                  {s.category && (
                    <span className="badge bg-slate-800 text-slate-400 capitalize">{s.category}</span>
                  )}
                  {scores && Object.entries(scores).map(([k, v]) => (
                    <span key={k} className="badge bg-slate-800 text-slate-400">
                      {k} · <span className="text-slate-200 font-mono">{v}/10</span>
                    </span>
                  ))}
                  <span className="badge bg-slate-800 text-slate-500 ml-auto">
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>

                {feedback?.keyTakeaway && (
                  <p className="text-xs text-brand-400 mt-3 flex items-start gap-1.5">
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