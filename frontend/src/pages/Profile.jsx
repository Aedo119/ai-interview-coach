import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function Field({ label, children }) {
  return (
    <div>
      <label className="label" style={{ marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Toast({ message, type, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3000); return () => clearTimeout(t); }, []);
  const color = type === 'error' ? '#ef4444' : '#10b981';
  return (
    <div style={{ position:'fixed', bottom:20, right:20, zIndex:9999, padding:'12px 18px', borderRadius:10,
      background: 'var(--bg-card)', border:`1px solid ${color}44`, boxShadow:'var(--shadow-lg)',
      display:'flex', alignItems:'center', gap:8 }}>
      <i className={`ti ${type==='error'?'ti-alert-circle':'ti-circle-check'}`} style={{ fontSize:16, color }} aria-hidden="true" />
      <span style={{ fontSize:13, color:'var(--text)' }}>{message}</span>
    </div>
  );
}

export default function Profile() {
  const { isLoggedIn, user, logout, token } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile]     = useState(null);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(false);
  const [form, setForm]           = useState({ name: '', email: '' });
  const [pwForm, setPwForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPwForm, setShowPwForm] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    const t = token || localStorage.getItem('token');
    fetch('/api/profile', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setProfile(data.user);
        setStats(data.stats);
        setForm({ name: data.user.name, email: data.user.email });
      })
      .catch(err => setToast({ message: err.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, [isLoggedIn]);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const t = token || localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setProfile(data.user);
      setEditing(false);
      setToast({ message: 'Profile updated', type: 'success' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const t = token || localStorage.getItem('token');
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setToast({ message: 'Password changed', type: 'success' });
      setShowPwForm(false);
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setToast({ message: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const t = token || localStorage.getItem('token');
    await fetch('/api/profile', { method: 'DELETE', headers: { Authorization: `Bearer ${t}` } });
    logout();
    navigate('/');
  }

  const inputStyle = { width:'100%', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', fontSize:14, color:'var(--text)', outline:'none' };

  if (!isLoggedIn) return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem 1.5rem' }}>
      <div style={{ textAlign:'center', maxWidth:360 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <i className="ti ti-lock" style={{ fontSize:26, color:'var(--text-subtle)' }} aria-hidden="true" />
        </div>
        <h2 style={{ fontSize:'1.25rem', fontWeight:600, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.5rem' }}>Sign in to view your profile</h2>
        <Link to="/login" className="btn btn-primary" style={{ fontSize:14, padding:'9px 20px', marginTop:'1rem', display:'inline-flex' }}>Sign in</Link>
      </div>
    </main>
  );

  if (loading) return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </main>
  );

  const initials = profile?.name?.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem' }}>
      <div style={{ maxWidth:640, margin:'0 auto', padding:'3rem 1.5rem' }}>

        {/* Header card */}
        <div className="card" style={{ padding:'2rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, marginBottom: editing ? '1.5rem' : 0 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--accent-soft)', border:'2px solid var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <span style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--accent)', fontFamily:'DM Sans, sans-serif' }}>{initials}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              {!editing ? (
                <>
                  <h1 style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 4px' }}>{profile?.name}</h1>
                  <p style={{ fontSize:13, color:'var(--text-muted)', margin:0 }}>{profile?.email}</p>
                  <p style={{ fontSize:12, color:'var(--text-subtle)', margin:'4px 0 0' }}>
                    Member since {new Date(profile?.created_at).toLocaleDateString('en', { month:'long', year:'numeric' })}
                  </p>
                </>
              ) : (
                <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>Edit profile</p>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ fontSize:13, padding:'7px 16px', flexShrink:0 }}>
                <i className="ti ti-pencil" style={{ fontSize:13 }} aria-hidden="true" /> Edit
              </button>
            )}
          </div>

          {editing && (
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <Field label="Name">
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} required />
              </Field>
              <Field label="Email">
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} required />
              </Field>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setEditing(false); setForm({ name: profile.name, email: profile.email }); }} className="btn btn-secondary" style={{ fontSize:13 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontSize:13 }}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:'1.5rem' }}>
            <div className="card" style={{ padding:'1.25rem', textAlign:'center' }}>
              <i className="ti ti-clipboard-list" style={{ fontSize:18, color:'var(--accent)', display:'block', marginBottom:6 }} aria-hidden="true" />
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif' }}>{stats.total_sessions || 0}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Sessions completed</div>
            </div>
            <div className="card" style={{ padding:'1.25rem', textAlign:'center' }}>
              <i className="ti ti-chart-bar" style={{ fontSize:18, color:'var(--accent)', display:'block', marginBottom:6 }} aria-hidden="true" />
              <div style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif' }}>{stats.avg_score || '—'}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>Average score</div>
            </div>
          </div>
        )}

        {/* Password */}
        <div className="card" style={{ padding:'1.5rem', marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: showPwForm ? '1.25rem' : 0 }}>
            <div>
              <p style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:'0 0 2px' }}>Password</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>Last changed unknown</p>
            </div>
            {!showPwForm && (
              <button onClick={() => setShowPwForm(true)} className="btn btn-secondary" style={{ fontSize:13, padding:'7px 16px' }}>Change password</button>
            )}
          </div>
          {showPwForm && (
            <form onSubmit={handlePasswordChange} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <Field label="Current password">
                <input type="password" required value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="New password">
                <input type="password" required minLength={6} value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} style={inputStyle} />
              </Field>
              <Field label="Confirm new password">
                <input type="password" required value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} style={inputStyle} />
              </Field>
              <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
                <button type="button" onClick={() => { setShowPwForm(false); setPwForm({ currentPassword:'', newPassword:'', confirm:'' }); }} className="btn btn-secondary" style={{ fontSize:13 }}>Cancel</button>
                <button type="submit" disabled={saving} className="btn btn-primary" style={{ fontSize:13 }}>{saving ? 'Updating…' : 'Update password'}</button>
              </div>
            </form>
          )}
        </div>

        {/* Danger zone */}
        <div className="card" style={{ padding:'1.5rem', border:'1px solid rgba(239,68,68,0.25)' }}>
          <p style={{ fontSize:14, fontWeight:600, color:'#ef4444', margin:'0 0 4px' }}>Danger zone</p>
          <p style={{ fontSize:12, color:'var(--text-muted)', margin:'0 0 1rem' }}>Permanently delete your account and all session history. This cannot be undone.</p>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="btn btn-secondary" style={{ fontSize:13, color:'#ef4444', borderColor:'rgba(239,68,68,0.3)' }}>
              Delete account
            </button>
          ) : (
            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>Are you sure?</span>
              <button onClick={handleDelete} className="btn btn-primary" style={{ fontSize:13, background:'#ef4444' }}>Yes, delete everything</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary" style={{ fontSize:13 }}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
    </main>
  );
}
