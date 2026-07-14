import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { const d = await api.login(form); login(d.token, d.user); navigate('/practice'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen pt-14 flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text)' }}>Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to access your history and analytics</p>
        </div>
        <div className="card p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[['email','Email','you@example.com','email'],['password','Password','••••••••','password']].map(([k,l,p,t]) => (
              <div key={k}>
                <label className="label">{l}</label>
                <input type={t} required value={form[k]} onChange={set(k)} placeholder={p} className="input" />
              </div>
            ))}
            {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5 rounded-lg">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent)' }} className="font-medium">Create one free</Link>
        </p>
      </div>
    </main>
  );
}
