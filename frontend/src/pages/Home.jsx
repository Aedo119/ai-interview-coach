import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CARDS = [
  { icon:'ti-brain',       tag:'AI feedback',    title:'Scored across five dimensions',       body:'Every answer gets a score from 1–10 across clarity, relevance, depth, structure, and impact — with specific strengths, improvements, and a single key takeaway.', t1:'Gemini AI',       t2:'All question types' },
  { icon:'ti-chart-radar', tag:'Visualisation',  title:'Radar chart and animated score bars', body:'See your answer profile at a glance on a radar chart, then drill into animated bar charts for each dimension with colour-coded thresholds.',                       t1:'No dependencies', t2:'Light & dark mode'  },
  { icon:'ti-microphone',  tag:'Speech input',   title:'Speak your answer aloud',             body:'Use your microphone instead of typing — just like a real interview. Interim text appears as you talk and is appended cleanly when you pause.',                     t1:'Web Speech API',  t2:'Chrome & Edge'      },
  { icon:'ti-list-check',  tag:'STAR analysis',  title:'Situation, task, action, result',     body:'Each answer is broken into the four STAR components and assessed individually, so you can see exactly which part of the framework needs more work.',               t1:'Behavioral',      t2:'All tracks'         },
  { icon:'ti-users',       tag:'Role tracks',    title:'SWE, ML engineer, and PM tracks',     body:'Thirty questions written specifically for each role — covering DS&A and system design for SWE, MLOps for ML, and prioritisation and metrics for PM.',              t1:'3 tracks',        t2:'10 questions each'  },
  { icon:'ti-trending-up', tag:'Analytics',      title:'Track your improvement over time',    body:'Score trend over your last 30 sessions, average by category, and average dimension scores — so you can see where you are improving fastest.',                      t1:'Score history',   t2:'Category heatmap'   },
];

const STATS = [
  { value: '50+',  label: 'Questions'         },
  { value: '5',    label: 'Dimensions scored' },
  { value: '3',    label: 'Role tracks'       },
  { value: '100%', label: 'Free to use'       },
];

function DotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 dot-grid opacity-40" />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 40%, var(--accent-glow) 0%, transparent 70%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, var(--bg) 100%)' }} />
    </div>
  );
}

function CardDeck() {
  const [current, setCurrent] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [visible, setVisible] = useState(true);

  function go(idx, dir) {
    setVisible(false);
    setAnimDir(dir);
    setTimeout(() => {
      setCurrent((idx + CARDS.length) % CARDS.length);
      setAnimDir(dir === 'next' ? 'in-right' : 'in-left');
      setVisible(true);
    }, 180);
  }

  const c = CARDS[current];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
      {/* Stacked deck */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, height: 260 }}>
        {/* Ghost cards behind */}
        <div style={{ position:'absolute', inset:0, borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', transform:'rotate(3deg) translateY(6px)', zIndex:1 }} />
        <div style={{ position:'absolute', inset:0, borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', transform:'rotate(1.5deg) translateY(3px)', zIndex:2 }} />
        {/* Main card */}
        <div style={{
          position:'absolute', inset:0, borderRadius:16,
          background:'var(--bg-card)', border:'1px solid var(--border)',
          boxShadow:'var(--shadow-md)', zIndex:3, padding:'1.75rem',
          display:'flex', flexDirection:'column', gap:'0.875rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : animDir === 'next' ? 'translateX(-24px)' : 'translateX(24px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={`ti ${c.icon}`} style={{ fontSize:20, color:'var(--accent)' }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontSize:11, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 2px' }}>{c.tag}</p>
              <p style={{ fontSize:16, fontWeight:600, color:'var(--text)', margin:0, lineHeight:1.3, fontFamily:'DM Sans, Inter, sans-serif' }}>{c.title}</p>
            </div>
          </div>
          <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.65, margin:0, flex:1 }}>{c.body}</p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, padding:'3px 10px', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>{c.t1}</span>
            <span style={{ fontSize:12, padding:'3px 10px', borderRadius:99, background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>{c.t2}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button onClick={() => go(current - 1, 'prev')} aria-label="Previous"
          className="btn btn-secondary" style={{ width:36, height:36, padding:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:16 }} aria-hidden="true" />
        </button>
        <div style={{ display:'flex', gap:6 }}>
          {CARDS.map((_, i) => (
            <button key={i} onClick={() => go(i, i > current ? 'next' : 'prev')} aria-label={`Card ${i+1}`}
              style={{ width:6, height:6, borderRadius:'50%', border:'none', cursor:'pointer', padding:0,
                background: i === current ? 'var(--accent)' : 'var(--border)', transition:'background 0.2s' }} />
          ))}
        </div>
        <button onClick={() => go(current + 1, 'next')} aria-label="Next"
          className="btn btn-secondary" style={{ width:36, height:36, padding:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-arrow-right" style={{ fontSize:16 }} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn } = useAuth();
  return (
    <main style={{ background:'var(--bg)' }}>
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden"
        style={{ minHeight:'100vh', padding:'5rem 1.5rem 6rem' }}>
        <DotGrid />
        <div style={{ position:'relative', zIndex:10, maxWidth:640, margin:'0 auto' }}>
          <div className="inline-flex items-center gap-2" style={{ padding:'6px 14px', borderRadius:99, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)', color:'var(--accent)', fontSize:12, fontWeight:500, marginBottom:'1.5rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2s ease-in-out infinite' }} />
            Powered by Google Gemini — completely free
          </div>
          <h1 style={{ fontSize:'clamp(2.5rem,6vw,3.75rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--text)', margin:'0 0 1.25rem', fontFamily:'DM Sans, Inter, sans-serif', lineHeight:1.1 }}>
            Practice interviews.<br />
            <span style={{ color:'var(--accent)' }}>Get hired faster.</span>
          </h1>
          <p style={{ fontSize:'1.1rem', color:'var(--text-muted)', marginBottom:'2.5rem', lineHeight:1.7, maxWidth:480, margin:'0 auto 2.5rem' }}>
            Answer real interview questions and get structured AI feedback scored across five dimensions with actionable improvements.
          </p>
          {isLoggedIn ? (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/tracks"   className="btn btn-primary"  style={{ fontSize:15, padding:'10px 24px' }}>Choose a track</Link>
              <Link to="/practice" className="btn btn-secondary" style={{ fontSize:15, padding:'10px 24px' }}>General practice</Link>
            </div>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="btn btn-primary"  style={{ fontSize:15, padding:'10px 24px' }}>Create free account</Link>
              <Link to="/login"    className="btn btn-secondary" style={{ fontSize:15, padding:'10px 24px' }}>Sign in</Link>
            </div>
          )}
          <p style={{ marginTop:'1rem', fontSize:12, color:'var(--text-subtle)' }}>No credit card required · Speech input works in Chrome and Edge</p>
        </div>
      </section>

      {/* Stats */}
      <section style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:900, margin:'0 auto', padding:'2.5rem 1.5rem', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'2rem' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'2rem', fontWeight:700, color:'var(--accent)', fontFamily:'DM Sans, sans-serif' }}>{s.value}</div>
              <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Card deck */}
      <section style={{ maxWidth:720, margin:'0 auto', padding:'5rem 1.5rem' }}>
        <div style={{ marginBottom:'3rem' }}>
          <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--accent)', marginBottom:12 }}>Features</p>
          <h2 style={{ fontSize:'2rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.75rem' }}>Everything in one place</h2>
          <p style={{ fontSize:15, color:'var(--text-muted)', lineHeight:1.7 }}>Built for serious candidates who want structured, specific feedback — not just encouragement.</p>
        </div>
        <CardDeck />
      </section>

      {/* Bottom CTA */}
      <section style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)', padding:'5rem 1.5rem', textAlign:'center' }}>
        <h2 style={{ fontSize:'2rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', marginBottom:'1rem' }}>Ready to start?</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Create a free account and start practicing in under a minute.</p>
        {isLoggedIn
          ? <Link to="/tracks"   className="btn btn-primary" style={{ fontSize:15, padding:'10px 24px' }}>Go to tracks</Link>
          : <Link to="/register" className="btn btn-primary" style={{ fontSize:15, padding:'10px 24px' }}>Create free account</Link>
        }
      </section>
    </main>
  );
}
