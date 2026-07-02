import ScoreChart from './ScoreChart';

function ScoreRing({ score }) {
  const r     = 36;
  const circ  = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color  = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

export default function FeedbackPanel({ feedback }) {
  if (!feedback) return null;

  return (
    <div className="card animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 text-center">
            <ScoreRing score={feedback.overallScore} />
            <p className="text-xs text-slate-500 mt-1">Overall</p>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base mb-1">AI Feedback</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feedback.summary}</p>
            {feedback.keyTakeaway && (
              <div className="mt-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
                <p className="text-xs font-semibold text-brand-400 mb-1">💡 Key Takeaway</p>
                <p className="text-sm text-slate-300">{feedback.keyTakeaway}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Score charts */}
        {feedback.scores && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Score Breakdown
            </h4>
            <ScoreChart scores={feedback.scores} />
          </div>
        )}

        {/* Strengths */}
        {feedback.strengths?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
              ✅ Strengths
            </h4>
            <ul className="space-y-2">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvements */}
        {feedback.improvements?.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
              🔧 Areas to Improve
            </h4>
            <ul className="space-y-2">
              {feedback.improvements.map((imp, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>{imp}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Interviewer thoughts */}
        {feedback.interviewerThoughts && (
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
            <h4 className="text-xs font-semibold text-slate-400 mb-2">
              🎤 What the interviewer would think
            </h4>
            <p className="text-sm text-slate-400 italic">{feedback.interviewerThoughts}</p>
          </div>
        )}
      </div>
    </div>
  );
}
