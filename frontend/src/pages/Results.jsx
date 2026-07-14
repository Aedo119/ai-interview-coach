import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

function parseScores(scores) {
  if (!scores) return null;
  if (typeof scores === 'string') { try { return JSON.parse(scores); } catch { return null; } }
  return scores;
}

function ScoreBadge({ score }) {
  const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  const bg    = score >= 75 ? 'rgba(16,185,129,0.1)' : score >= 50 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
  return (
    <span style={{ fontSize:12, fontWeight:600, fontFamily:'monospace', padding:'3px 10px', borderRadius:99, color, background:bg, border:`1px solid ${color}33` }}>
      {score}
    </span>
  );
}

function EmptyState({ icon, title, body, to, cta }) {
  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem 1.5rem' }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <i className={`ti ${icon}`} style={{ fontSize:26, color:'var(--text-subtle)' }} aria-hidden="true" />
        </div>
        <h2 style={{ fontSize:'1.25rem', fontWeight:600, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.5rem' }}>{title}</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:'1.5rem' }}>{body}</p>
        {to && <Link to={to} className="btn btn-primary" style={{ fontSize:14, padding:'9px 20px' }}>{cta}</Link>}
      </div>
    </main>
  );
}

export default function Results() {
  const { isLoggedIn, token } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return; }
    const t = token || localStorage.getItem('token');
    fetch('/api/history', { headers: { Authorization: `Bearer ${t}` } })
      .then(r => r.json())
      .then(data => { if (data.error) throw new Error(data.error); setSessions(data.sessions || []); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  async function handleDelete(id) {
    await api.deleteSession(id);
    setSessions(s => s.filter(x => x.id !== id));
  }

  if (!isLoggedIn) return (
    <EmptyState icon="ti-lock" title="Sign in to see your history"
      body="Your practice sessions are saved to your account." to="/login" cta="Sign in" />
  );
  if (loading) return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </main>
  );
  if (error) return (
    <EmptyState icon="ti-alert-triangle" title="Failed to load history" body={error} to="/practice" cta="Back to practice" />
  );
  if (!sessions.length) return (
    <EmptyState icon="ti-clipboard-list" title="No sessions yet"
      body="Complete a practice session and it will appear here." to="/practice" cta="Start practicing" />
  );

  const avg = Math.round(sessions.reduce((a, s) => a + (s.overall_score || 0), 0) / sessions.length);

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem' }}>
      <div style={{ maxWidth:720, margin:'0 auto', padding:'3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'2rem', gap:16 }}>
          <div>
            <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 4px' }}>Practice history</h1>
            <p style={{ fontSize:14, color:'var(--text-muted)', margin:0 }}>
              {sessions.length} session{sessions.length !== 1 ? 's' : ''} · average score <span style={{ color:'var(--text)', fontFamily:'monospace', fontWeight:600 }}>{avg}</span>
            </p>
          </div>
          <Link to="/practice" className="btn btn-primary" style={{ fontSize:13, padding:'8px 16px', whiteSpace:'nowrap' }}>
            <i className="ti ti-plus" style={{ fontSize:13 }} aria-hidden="true" /> New question
          </Link>
        </div>

        {/* Sessions */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
          {sessions.map(s => {
            const scores   = parseScores(s.scores);
            const feedback = typeof s.feedback === 'string' ? (() => { try { return JSON.parse(s.feedback); } catch { return null; } })() : s.feedback;
            return (
              <div key={s.id} className="card card-hover" style={{ padding:'1.25rem 1.5rem' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12, marginBottom:8 }}>
                  <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', lineHeight:1.5, margin:0 }}>{s.question}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                    {s.overall_score && <ScoreBadge score={s.overall_score} />}
                    <button onClick={() => handleDelete(s.id)} aria-label="Delete session"
                      style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-subtle)', padding:4, borderRadius:6, lineHeight:1 }}
                      onMouseEnter={e => e.currentTarget.style.color='#ef4444'}
                      onMouseLeave={e => e.currentTarget.style.color='var(--text-subtle)'}>
                      <i className="ti ti-x" style={{ fontSize:14 }} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p style={{ fontSize:12, color:'var(--text-subtle)', margin:'0 0 12px', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{s.answer}</p>

                <div style={{ display:'flex', flexWrap:'wrap', gap:6, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                  {s.category && (
                    <span className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)', textTransform:'capitalize' }}>{s.category}</span>
                  )}
                  {scores && Object.entries(scores).map(([k, v]) => (
                    <span key={k} className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>
                      {k} <span style={{ color:'var(--text)', fontFamily:'monospace' }}>{v}/10</span>
                    </span>
                  ))}
                  <span className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-subtle)', border:'1px solid var(--border)', marginLeft:'auto' }}>
                    {new Date(s.created_at).toLocaleDateString()}
                  </span>
                </div>

                {feedback?.keyTakeaway && (
                  <div style={{ marginTop:10, display:'flex', alignItems:'flex-start', gap:8 }}>
                    <i className="ti ti-bulb" style={{ fontSize:14, color:'var(--accent)', flexShrink:0, marginTop:2 }} aria-hidden="true" />
                    <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>{feedback.keyTakeaway}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
