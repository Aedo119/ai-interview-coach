import { Link } from 'react-router-dom';

const features = [
  { icon: '🤖', title: 'Gemini AI Feedback',     desc: 'Get instant, expert-level feedback on every answer from Claude.' },
  { icon: '📊', title: 'Scoring Rubric',          desc: 'Scored on clarity, relevance, depth, structure, and impact.' },
  { icon: '⭐', title: 'STAR Method Analysis',    desc: 'See exactly how well your answer follows the STAR framework.' },
  { icon: '✨', title: 'Improved Answer',          desc: 'See a rewritten model answer to level up your technique.' },
  { icon: '📚', title: '50+ Question Bank',       desc: 'Behavioral, technical, system design, situational, and culture fit.' },
  { icon: '🎯', title: 'Category Filter',         desc: 'Focus on the question types that matter most for your role.' },
];

const stats = [
  { value: '50+',    label: 'Questions' },
  { value: '5',      label: 'Categories' },
  { value: 'Gemini', label: 'AI Engine' },
  { value: '∞',      label: 'Practice rounds' },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-600/10 border border-brand-600/20 text-brand-400 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse"></span>
          Powered by Gemini AI
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white mb-4 max-w-2xl">
          Ace your next{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">
            interview
          </span>
        </h1>
        <p className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed">
          Practice with 50+ real interview questions and get instant, expert AI feedback on every answer — scored across 5 dimensions.
        </p>

        <div className="flex gap-3">
          <Link to="/practice" className="btn-primary text-base px-7 py-3">
            Start Practicing →
          </Link>
          <Link to="/results" className="btn-secondary text-base px-7 py-3">
            View History
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-8 mt-16 pt-12 border-t border-slate-800 max-w-xl w-full">
          {stats.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 pb-20 max-w-5xl mx-auto w-full">
        <h2 className="text-2xl font-semibold text-white text-center mb-10">
          Everything you need to prepare
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(f => (
            <div key={f.title} className="card p-5 hover:border-slate-700 transition-colors">
              <span className="text-2xl mb-3 block">{f.icon}</span>
              <h3 className="font-semibold text-slate-100 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="border-t border-slate-800 py-16 text-center px-4">
        <h2 className="text-2xl font-semibold text-white mb-3">Ready to get hired?</h2>
        <p className="text-slate-400 mb-6">No account needed. Start practicing in seconds.</p>
        <Link to="/practice" className="btn-primary text-base px-8 py-3">
          Launch Practice Session →
        </Link>
      </section>
    </main>
  );
}
