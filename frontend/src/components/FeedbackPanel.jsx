import { useState } from 'react';
import ScoreChart from './ScoreChart';

function ScoreRing({ score }) {
  const r = 36, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="6"
          strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
          transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color: 'var(--text)' }}>{score}</span>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'overview', label: 'Overview'       },
  { id: 'star',     label: 'STAR Analysis'  },
  { id: 'improved', label: 'Model Answer'   },
];

export default function FeedbackPanel({ feedback }) {
  const [tab, setTab] = useState('overview');
  if (!feedback) return null;

  return (
    <div className="card animate-slide-up overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0 text-center">
            <ScoreRing score={feedback.overallScore} />
            <p className="text-xs mt-1" style={{ color: 'var(--text-subtle)' }}>Overall</p>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Feedback</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{feedback.summary}</p>
            {feedback.keyTakeaway && (
              <div className="mt-3 p-3 rounded-xl text-sm" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-glow)', color: 'var(--text-muted)' }}>
                <span className="font-semibold" style={{ color: 'var(--accent)' }}>Key takeaway: </span>
                {feedback.keyTakeaway}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex" style={{ borderBottom: '1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex-1 py-3 text-sm font-medium transition-colors"
            style={{ color: tab === t.id ? 'var(--accent)' : 'var(--text-muted)',
                     borderBottom: tab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                     background: 'transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 space-y-6">
        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {feedback.scores && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-subtle)' }}>Score Breakdown</p>
                <ScoreChart scores={feedback.scores} />
              </div>
            )}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#10b981' }}>Strengths</p>
              <ul className="space-y-2">
                {feedback.strengths?.map((s,i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:3 }}><polyline points="20 6 9 17 4 12"/></svg>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#f59e0b' }}>To improve</p>
              <ul className="space-y-2">
                {feedback.improvements?.map((imp,i) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:3 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
            {feedback.interviewerThoughts && (
              <div className="p-4 rounded-xl text-sm" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-subtle)' }}>What the interviewer would think</p>
                <p className="italic">{feedback.interviewerThoughts}</p>
              </div>
            )}
          </div>
        )}

        {/* STAR */}
        {tab === 'star' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              The STAR framework (Situation, Task, Action, Result) is the standard structure for behavioral answers.
            </p>
            {feedback.starAnalysis
              ? Object.entries(feedback.starAnalysis).map(([key, value]) => (
                <div key={key} className="p-4 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-md text-xs font-bold flex items-center justify-center"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {key[0].toUpperCase()}
                    </span>
                    <span className="text-sm font-semibold capitalize" style={{ color: 'var(--text)' }}>{key}</span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{value}</p>
                </div>
              ))
              : <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>STAR analysis not available for this response.</p>
            }
          </div>
        )}

        {/* MODEL ANSWER */}
        {tab === 'improved' && (
          <div className="space-y-3 animate-fade-in">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              A strong version of this answer — use it as inspiration, not a script.
            </p>
            <div className="p-5 rounded-xl" style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--accent)' }}>Model answer</p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-muted)' }}>
                {feedback.improvedAnswer || 'Not available for this response.'}
              </p>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Always answer in your own words using your real experiences.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
