import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname }                     = useLocation();
  const { user, logout, isLoggedIn }     = useAuth();
  const navigate                         = useNavigate();

  function handleLogout() { logout(); navigate('/'); }

  const navLinks = [
    { to: '/',          label: 'Home' },
    { to: '/tracks',    label: 'Tracks' },
    { to: '/practice',  label: 'Practice' },
    { to: '/results',   label: 'History' },
    { to: '/analytics', label: 'Analytics' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <span className="text-xl">🎯</span>
          <span className="text-sm font-semibold tracking-tight text-white">
            Interview<span className="text-brand-400">Coach</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.to
                  ? 'bg-brand-600/20 text-brand-400'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}>
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <span className="text-xs text-slate-500 hidden sm:block">Hi, {user?.name?.split(' ')[0]}</span>
              <button onClick={handleLogout} className="btn-ghost text-sm">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="btn-ghost text-sm">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
