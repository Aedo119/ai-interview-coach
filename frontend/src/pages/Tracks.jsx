import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const TRACK_META = {
  swe: { icon: 'ti-code',        color: 'var(--accent)',  colorSoft: 'var(--accent-soft)', colorGlow: 'var(--accent-glow)' },
  ml:  { icon: 'ti-cpu',         color: '#7c3aed',        colorSoft: 'rgba(124,58,237,0.08)', colorGlow: 'rgba(124,58,237,0.2)' },
  pm:  { icon: 'ti-layout-board', color: '#059669',       colorSoft: 'rgba(5,150,105,0.08)', colorGlow: 'rgba(5,150,105,0.2)' },
};

export default function Tracks() {
  const [tracks, setTracks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    api.getTracks().then(d => setTracks(d.tracks)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center" style={{ background:'var(--bg)' }}>
      <div style={{ width:32, height:32, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
    </main>
  );

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'4rem 1.5rem' }}>
        <div style={{ marginBottom:'3rem' }}>
          <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--accent)', marginBottom:12 }}>Role tracks</p>
          <h1 style={{ fontSize:'2rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.75rem' }}>Choose your track</h1>
          <p style={{ fontSize:15, color:'var(--text-muted)' }}>Role-specific questions tailored to what interviewers actually ask.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px,1fr))', gap:'1.25rem', marginBottom:'2.5rem' }}>
          {tracks.map(track => {
            const meta = TRACK_META[track.id] || TRACK_META.swe;
            return (
              <div key={track.id} className="card card-hover" style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div style={{ width:44, height:44, borderRadius:12, background: meta.colorSoft, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className={`ti ${meta.icon}`} style={{ fontSize:22, color: meta.color }} aria-hidden="true" />
                </div>
                <div style={{ flex:1 }}>
                  <h3 style={{ fontSize:16, fontWeight:600, color:'var(--text)', margin:'0 0 6px', fontFamily:'DM Sans, sans-serif' }}>{track.label}</h3>
                  <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6, margin:0 }}>{track.description}</p>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:12, color:'var(--text-subtle)' }}>{track.questionCount} questions</span>
                  <button onClick={() => navigate(`/practice?track=${track.id}`)}
                    className="btn btn-primary" style={{ fontSize:13, padding:'7px 16px', background: meta.color }}>
                    Start <i className="ti ti-arrow-right" style={{ fontSize:13 }} aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ textAlign:'center', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
          <button onClick={() => navigate('/practice')} className="btn btn-ghost" style={{ fontSize:14, color:'var(--text-muted)' }}>
            Or practice with the general question bank
            <i className="ti ti-arrow-right" style={{ fontSize:14 }} aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}
