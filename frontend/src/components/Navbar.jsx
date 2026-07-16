import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth }  from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;

const NAV_LINKS = [
  { to: '/tracks',    label: 'Tracks'    },
  { to: '/mock',      label: 'Mock interview' },
  { to: '/practice',  label: 'Practice'  },
  { to: '/results',   label: 'History'   },
  { to: '/analytics', label: 'Analytics' },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout, isLoggedIn } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  return (
    <nav style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-base" style={{ color: 'var(--text)', fontFamily: 'DM Sans, Inter, sans-serif' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          InterviewCoach
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} className="btn btn-ghost text-sm"
              style={{ color: pathname === link.to ? 'var(--accent)' : 'var(--text-muted)', background: pathname === link.to ? 'var(--accent-soft)' : 'transparent' }}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggle} className="btn btn-ghost rounded-lg" style={{ width: 36, height: 36, padding: 0, color: 'var(--text-muted)' }}>
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-sm hidden sm:flex items-center gap-1.5" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                <i className="ti ti-user-circle" style={{ fontSize: 15 }} aria-hidden="true" />
                {user?.name?.split(' ')[0]}
              </Link>
              <button onClick={() => { logout(); navigate('/'); }} className="btn btn-secondary text-sm">Sign out</button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login"    className="btn btn-ghost text-sm">Sign in</Link>
              <Link to="/register" className="btn btn-primary text-sm">Get started</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
