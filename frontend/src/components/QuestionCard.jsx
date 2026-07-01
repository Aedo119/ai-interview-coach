const CATEGORY_STYLES = {
  behavioral:    { color: 'text-violet-400 bg-violet-400/10 border-violet-400/20', icon: '🧠' },
  technical:     { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',      icon: '💻' },
  'system-design': { color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',    icon: '🏗️' },
  situational:   { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',   icon: '⚡' },
  'culture-fit': { color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', icon: '🤝' },
};

const DIFFICULTY_STYLES = {
  easy:   'text-emerald-400 bg-emerald-400/10',
  medium: 'text-amber-400 bg-amber-400/10',
  hard:   'text-red-400 bg-red-400/10',
};

export default function QuestionCard({ question, showTips = false }) {
  if (!question) return null;

  const cat  = CATEGORY_STYLES[question.category] || CATEGORY_STYLES.behavioral;
  const diff = DIFFICULTY_STYLES[question.difficulty] || DIFFICULTY_STYLES.medium;

  return (
    <div className="card p-6 animate-fade-in">
      {/* Badges */}
      <div className="flex items-center gap-2 mb-4">
        <span className={`badge border ${cat.color}`}>
          {cat.icon} {question.category.replace('-', ' ')}
        </span>
        <span className={`badge ${diff} capitalize`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question text */}
      <h2 className="text-lg font-semibold text-slate-100 leading-relaxed mb-4">
        {question.question}
      </h2>

      {/* Tips */}
      {showTips && question.tips?.length > 0 && (
        <div className="mt-4 p-4 bg-brand-950/40 border border-brand-900/40 rounded-xl">
          <p className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
            💡 Tips
          </p>
          <ul className="space-y-1">
            {question.tips.map((tip, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-brand-500 mt-0.5">·</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
