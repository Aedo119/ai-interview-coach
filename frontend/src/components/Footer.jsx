import { Link } from 'react-router-dom';

const LINKS = {
  Practice: [
    { label: 'General practice', to: '/practice'        },
    { label: 'SWE track',        to: '/practice?track=swe' },
    { label: 'ML engineer track',to: '/practice?track=ml'  },
    { label: 'PM track',         to: '/practice?track=pm'  },
  ],
  Account: [
    { label: 'Sign in',          to: '/login'      },
    { label: 'Create account',   to: '/register'   },
    { label: 'Practice history', to: '/results'    },
    { label: 'Analytics',        to: '/analytics'  },
  ],
};

const TECH = ['React 18', 'Node.js', 'PostgreSQL', 'Gemini API'];

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3.5rem 2rem 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr', gap: '3rem', paddingBottom: '3rem' }}>

          {/* Brand col */}
          <div>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: '0.875rem', textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
              </div>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontFamily: 'DM Sans, Inter, sans-serif' }}>InterviewCoach</span>
            </Link>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: 220, margin: '0 0 1.25rem' }}>
              AI-powered interview practice with real feedback — scored, structured, and free.
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TECH.map(t => (
                <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: 'var(--bg-subtle)', color: 'var(--text-subtle)', border: '1px solid var(--border)' }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Link cols */}
          {Object.entries(LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-subtle)', margin: '0 0 1rem' }}>{heading}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(l => (
                  <Link key={l.to} to={l.to} style={{ fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid var(--border)', padding: '1.25rem 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
            InterviewCoach — open portfolio project. Built to practice, built to ship.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="ti ti-brand-github" style={{ fontSize: 14, color: 'var(--text-subtle)' }} aria-hidden="true" />
            <a href="https://github.com/Aedo119/ai-interview-coach" target="_blank" rel="noreferrer"
              style={{ fontSize: 12, color: 'var(--text-subtle)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-subtle)'}>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}