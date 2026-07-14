const CATEGORY_STYLES = {
  behavioral:      { color: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Behavioral'    },
  technical:       { color: '#0891b2',       bg: 'rgba(8,145,178,0.08)', label: 'Technical'   },
  'system-design': { color: '#7c3aed',       bg: 'rgba(124,58,237,0.08)', label: 'System Design' },
  situational:     { color: '#d97706',       bg: 'rgba(217,119,6,0.08)', label: 'Situational' },
  'culture-fit':   { color: '#059669',       bg: 'rgba(5,150,105,0.08)', label: 'Culture Fit' },
};
const DIFF_STYLES = {
  easy:   { color: '#059669', bg: 'rgba(5,150,105,0.08)'  },
  medium: { color: '#d97706', bg: 'rgba(217,119,6,0.08)'  },
  hard:   { color: '#dc2626', bg: 'rgba(220,38,38,0.08)'  },
};

export default function QuestionCard({ question, showTips = false }) {
  if (!question) return null;
  const cat  = CATEGORY_STYLES[question.category] || CATEGORY_STYLES.behavioral;
  const diff = DIFF_STYLES[question.difficulty]   || DIFF_STYLES.medium;
  return (
    <div className="card p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-4">
        <span className="badge" style={{ color: cat.color, background: cat.bg, border: `1px solid ${cat.color}22` }}>
          {cat.label}
        </span>
        <span className="badge capitalize" style={{ color: diff.color, background: diff.bg, border: `1px solid ${diff.color}22` }}>
          {question.difficulty}
        </span>
      </div>
      <h2 className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>
        {question.question}
      </h2>
      {showTips && question.tips?.length > 0 && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-glow)' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--accent)' }}>Tips</p>
          <ul className="space-y-1">
            {question.tips.map((tip, i) => (
              <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent)', marginTop: 2 }}>·</span>{tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
