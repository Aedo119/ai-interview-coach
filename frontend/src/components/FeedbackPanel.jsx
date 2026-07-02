import { useState } from 'react';
import ScoreChart from './ScoreChart';

function ScoreRing({ score, size = 80 }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#1e293b" strokeWidth="6" />
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
    </div>
  );
}

export default function FeedbackPanel({ feedback }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!feedback) return null;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'star',     label: 'STAR Analysis' },
    { id: 'improved', label: 'Improved Answer' },
  ];

  return (
    <div className="card animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            <ScoreRing score={feedback.overallScore} size={80} />
            <p className="text-xs text-center text-slate-500 mt-1">Overall</p>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-base mb-1">AI Feedback</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{feedback.summary}</p>
            <div className="mt-3 p-3 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <p className="text-xs font-semibold text-brand-400 mb-1">💡 Key Takeaway</p>
              <p className="text-sm text-slate-300">{feedback.keyTakeaway}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === t.id
                ? 'text-brand-400 border-b-2 border-brand-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-6 space-y-5">

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">

            {/* ── NEW: Radar + Bar charts ── */}
            {feedback.scores && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                  Score Breakdown
                </h4>
                <ScoreChart scores={feedback.scores} />
              </div>
            )}

            {/* Strengths */}
            <div>
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">
                ✅ Strengths
              </h4>
              <ul className="space-y-2">
                {feedback.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5 flex-shrink-0">✓</span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div>
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">
                🔧 Areas to Improve
              </h4>
              <ul className="space-y-2">
                {feedback.improvements?.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>

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
        )}

        {/* STAR ANALYSIS */}
        {activeTab === 'star' && (
          <div className="space-y-4 animate-fade-in">
            <p className="text-sm text-slate-500">
              The STAR method (Situation, Task, Action, Result) is the gold standard for behavioral answers.
            </p>
            {feedback.starAnalysis && Object.entries(feedback.starAnalysis).map(([key, value]) => (
              <div key={key} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600/30 text-brand-400 text-xs font-bold flex items-center justify-center">
                    {key[0].toUpperCase()}
                  </span>
                  <h4 className="text-sm font-semibold text-slate-300 capitalize">{key}</h4>
                </div>
                <p className="text-sm text-slate-400">{value}</p>
              </div>
            ))}
            {!feedback.starAnalysis && (
              <p className="text-sm text-slate-600 italic">
                STAR analysis not available for this response.
              </p>
            )}
          </div>
        )}

        {/* IMPROVED ANSWER */}
        {activeTab === 'improved' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm text-slate-500">
              Here's how a strong candidate might answer this question:
            </p>
            <div className="p-5 bg-slate-800/40 border border-brand-900/40 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-brand-400"></span>
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider">
                  Model Answer
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {feedback.improvedAnswer || 'Not available for this response.'}
              </p>
            </div>
            <p className="text-xs text-slate-600">
              Use this as inspiration — always answer in your own words with your real experiences.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
