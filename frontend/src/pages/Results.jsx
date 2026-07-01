import { Link } from 'react-router-dom';

// In Sprint 2, this will pull from PostgreSQL.
// For Sprint 1, we read from sessionStorage to persist across page nav.

function getHistory() {
  try {
    const raw = sessionStorage.getItem('interview_history');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function ScorePill({ score }) {
  const color = score >= 75 ? 'bg-emerald-500/20 text-emerald-400'
    : score >= 50 ? 'bg-amber-500/20 text-amber-400'
    : 'bg-red-500/20 text-red-400';
  return (
    <span className={`badge ${color} font-mono font-semibold`}>{score}</span>
  );
}

export default function Results() {
  const history = getHistory();

  if (history.length === 0) {
    return (
      <main className="min-h-screen pt-14 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <h2 className="text-xl font-semibold text-white mb-2">No history yet</h2>
          <p className="text-slate-500 mb-6">
            Complete a practice session and your results will appear here.
          </p>
          <Link to="/practice" className="btn-primary">
            Start Practicing →
          </Link>
        </div>
      </main>
    );
  }

  const avgScore = Math.round(
    history.reduce((acc, h) => acc + (h.feedback?.overallScore || 0), 0) / history.length
  );

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Session History</h1>
            <p className="text-sm text-slate-500 mt-1">
              {history.length} answer{history.length !== 1 ? 's' : ''} · avg score{' '}
              <span className="text-white font-mono">{avgScore}</span>
            </p>
          </div>
          <Link to="/practice" className="btn-primary text-sm">
            + New Question
          </Link>
        </div>

        <div className="space-y-4">
          {[...history].reverse().map((item, i) => (
            <div key={i} className="card p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <p className="text-sm font-medium text-slate-200 leading-snug">
                  {item.question?.question}
                </p>
                {item.feedback && <ScorePill score={item.feedback.overallScore} />}
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                {item.answer}
              </p>

              {item.feedback && (
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                  {Object.entries(item.feedback.scores || {}).map(([key, val]) => (
                    <span key={key} className="badge bg-slate-800 text-slate-400">
                      {key} · <span className="text-slate-200 font-mono">{val}/10</span>
                    </span>
                  ))}
                </div>
              )}

              {item.feedback?.keyTakeaway && (
                <p className="text-xs text-brand-400 mt-3 flex items-start gap-1.5">
                  <span>💡</span>
                  {item.feedback.keyTakeaway}
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-700 text-center mt-8">
          History is stored for this browser session · Sprint 2 adds persistent storage →
        </p>
      </div>
    </main>
  );
}
