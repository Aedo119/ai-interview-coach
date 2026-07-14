import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* ── Icons ──────────────────────────────────────────────────── */
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const icons = {
  brain:   'M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z',
  chart:   'M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3',
  mic:     'M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z M19 10v2a7 7 0 0 1-14 0v-2 M12 19v3 M8 22h8',
  star:    'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  shield:  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75',
  zap:     'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  check:   'M20 6L9 17l-5-5',
  arrow:   'M5 12h14 M12 5l7 7-7 7',
};

/* ── Dot-grid hero background ────────────────────────────────── */
function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {/* Dot pattern */}
      <div className="absolute inset-0 dot-grid opacity-40" />
      {/* Radial fade — centre glow */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 70% 50% at 50% 40%, var(--accent-glow) 0%, transparent 70%)'
      }} />
      {/* Edge fade to page background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, var(--bg) 100%)'
      }} />
    </div>
  );
}

/* ── Feature accordion ───────────────────────────────────────── */
const FEATURES = [
  {
    icon: icons.brain,
    title: 'AI-powered feedback',
    summary: 'Every answer evaluated across five dimensions by Gemini.',
    detail: 'Clarity, relevance, depth, structure, and impact — each scored from 1–10 with specific reasoning. You get an overall score, three concrete strengths, three concrete improvements, and the single most important thing to change.',
  },
  {
    icon: icons.chart,
    title: 'Visual scoring rubric',
    summary: 'Radar chart and animated bars make your performance instantly readable.',
    detail: 'A radar chart gives you a shape for your overall answer profile at a glance. Animated bar charts break down each dimension with colour-coded thresholds so you know at a glance where you are and where to focus next.',
  },
  {
    icon: icons.mic,
    title: 'Speak your answer',
    summary: 'Use your microphone instead of typing — just like the real thing.',
    detail: 'The Web Speech API transcribes your spoken answer in real time. Interim text appears as you talk, and is appended cleanly when you pause. Works in Chrome and Edge with no setup required.',
  },
  {
    icon: icons.star,
    title: 'STAR method analysis',
    summary: 'See how well your answer follows the gold-standard behavioral framework.',
    detail: 'Each answer is broken down into Situation, Task, Action, and Result. The AI assesses whether each element was present and effective, so you can see exactly which part of the framework needs work.',
  },
  {
    icon: icons.users,
    title: 'Role-specific tracks',
    summary: 'Curated question sets for SWE, ML Engineer, and Product Manager.',
    detail: 'Thirty questions written specifically for each role — not generic interview questions. SWE questions cover DS&A, system design, and debugging. ML covers bias-variance, MLOps, and production monitoring. PM covers prioritisation, metrics, and stakeholder management.',
  },
  {
    icon: icons.zap,
    title: 'Progress analytics',
    summary: 'Track improvement over time with your score history and category heatmap.',
    detail: 'Your score trend over the last 30 sessions, average score broken down by category, and average dimension scores across all sessions — so you can see whether your behavioral answers are improving faster than your technical ones, and act accordingly.',
  },
];

function Accordion() {
  const [open, setOpen] = useState(0);
  return (
    <div className="divide-y" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', '--tw-divide-opacity': 1 }}>
      {FEATURES.map((f, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center gap-4 py-5 text-left transition-colors"
            style={{ background: 'transparent' }}
          >
            <span className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: open === i ? 'var(--accent)' : 'var(--accent-soft)', color: open === i ? '#fff' : 'var(--accent)', transition: 'all 0.2s' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d={f.icon} />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{f.title}</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{f.summary}</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ color: 'var(--text-subtle)', flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {open === i && (
            <div className="pb-5 pl-13 animate-fade-in" style={{ paddingLeft: '52px' }}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.detail}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Stats strip ─────────────────────────────────────────────── */
const STATS = [
  { value: '50+',  label: 'Questions' },
  { value: '5',    label: 'Dimensions scored' },
  { value: '3',    label: 'Role tracks' },
  { value: '100%', label: 'Free to use' },
];

/* ── Main page ───────────────────────────────────────────────── */
export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <main style={{ background: 'var(--bg)' }}>
      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center overflow-hidden">
        <DotGrid />
        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-medium"
            style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-glow" style={{ background: 'var(--accent)' }} />
            Powered by Google Gemini — completely free
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-bold mb-5 leading-tight"
            style={{ fontFamily: 'DM Sans, Inter, sans-serif', color: 'var(--text)', letterSpacing: '-0.03em' }}>
            Practice interviews.<br />
            <span style={{ color: 'var(--accent)' }}>Get hired faster.</span>
          </h1>

          <p className="text-lg mb-10 leading-relaxed max-w-lg mx-auto" style={{ color: 'var(--text-muted)' }}>
            Answer real interview questions and receive structured AI feedback — scored across five dimensions with actionable improvements.
          </p>

          {/* CTAs */}
          {isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/tracks"   className="btn btn-primary text-base px-7 py-3">Choose a track</Link>
              <Link to="/practice" className="btn btn-secondary text-base px-7 py-3">General practice</Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn btn-primary text-base px-7 py-3">Create free account</Link>
              <Link to="/login"    className="btn btn-secondary text-base px-7 py-3">Sign in</Link>
            </div>
          )}

          <p className="mt-4 text-xs" style={{ color: 'var(--text-subtle)' }}>
            No credit card required · Speech input works in Chrome and Edge
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold mb-1" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--accent)' }}>{s.value}</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features accordion */}
      <section className="max-w-2xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>Features</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' }}>
            Everything in one place
          </h2>
          <p className="mt-3 text-base" style={{ color: 'var(--text-muted)' }}>
            Built for serious candidates who want structured, specific feedback — not just encouragement.
          </p>
        </div>
        <Accordion />
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' }}>
            Ready to start?
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            Create a free account and start practicing in under a minute.
          </p>
          {isLoggedIn ? (
            <Link to="/tracks" className="btn btn-primary text-base px-8 py-3">Go to tracks</Link>
          ) : (
            <Link to="/register" className="btn btn-primary text-base px-8 py-3">Create free account</Link>
          )}
        </div>
      </section>
    </main>
  );
}
