import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const CARDS = [
  { icon:'ti-brain',       tag:'AI feedback',   title:'Scored across five dimensions',      body:'Every answer gets a score from 1–10 across clarity, relevance, depth, structure, and impact — with specific strengths, improvements, and a key takeaway.',    p1:'Gemini AI',       p2:'All question types' },
  { icon:'ti-chart-radar', tag:'Visualisation', title:'Radar chart and animated score bars',body:'See your answer profile on a radar chart and drill into animated bar charts per dimension with colour-coded thresholds.',                                       p1:'No dependencies', p2:'Light and dark mode' },
  { icon:'ti-microphone',  tag:'Speech input',  title:'Speak your answer aloud',            body:'Use your microphone instead of typing — just like a real interview. Interim text appears as you speak and is appended cleanly.',                               p1:'Web Speech API',  p2:'Chrome and Edge' },
  { icon:'ti-list-check',  tag:'STAR analysis', title:'Situation, task, action, result',    body:'Each answer broken into four STAR components and assessed individually — so you can see exactly which part of the framework needs work.',                      p1:'Behavioral focus',p2:'All tracks' },
  { icon:'ti-users',       tag:'Role tracks',   title:'SWE, ML engineer, and PM tracks',   body:'Thirty questions written specifically for each role — DS&A and system design for SWE, MLOps for ML, and prioritisation and metrics for PM.',                   p1:'3 tracks',        p2:'10 questions each' },
  { icon:'ti-trending-up', tag:'Analytics',     title:'Track your improvement over time',   body:'Score trend over your last 30 sessions, average by category, and average dimension scores — see where you are improving fastest.',                             p1:'Score history',   p2:'Category heatmap' },
];

const STATS = [
  { value: '50+',  label: 'Curated interview questions' },
  { value: '5',    label: 'Dimensions scored per answer' },
  { value: '3',    label: 'Role-specific tracks' },
  { value: '100%', label: 'Free to use, always' },
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
  const [visible, setVisible] = useState(true);
  const [dir, setDir]         = useState('next');

  function go(idx, d) {
    setVisible(false); setDir(d);
    setTimeout(() => { setCurrent((idx + CARDS.length) % CARDS.length); setVisible(true); }, 180);
  }

  const c = CARDS[current];
  return (
    <div>
      <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--accent)', margin:'0 0 1.125rem' }}>Features</p>
      <div style={{ position:'relative', height:230 }}>
        {/* Ghost cards */}
        <div style={{ position:'absolute', inset:0, borderRadius:14, background:'var(--bg-subtle)', border:'1px solid var(--border)', transform:'rotate(3.5deg) translateY(7px)', zIndex:1 }} />
        <div style={{ position:'absolute', inset:0, borderRadius:14, background:'var(--bg-subtle)', border:'1px solid var(--border)', transform:'rotate(1.5deg) translateY(3px)', zIndex:2 }} />
        {/* Main card */}
        <div style={{
          position:'absolute', inset:0, borderRadius:14, zIndex:3,
          background:'var(--bg-card)', border:'1px solid var(--border)',
          boxShadow:'var(--shadow-md)', padding:'1.5rem',
          display:'flex', flexDirection:'column', gap:'0.75rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateX(0)' : `translateX(${dir === 'next' ? -18 : 18}px)`,
          transition:'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:38, height:38, borderRadius:9, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={`ti ${c.icon}`} style={{ fontSize:18, color:'var(--accent)' }} aria-hidden="true" />
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:600, color:'var(--accent)', textTransform:'uppercase', letterSpacing:'0.07em', margin:'0 0 2px' }}>{c.tag}</p>
              <p style={{ fontSize:15, fontWeight:600, color:'var(--text)', margin:0, lineHeight:1.25, fontFamily:'DM Sans, Inter, sans-serif' }}>{c.title}</p>
            </div>
          </div>
          <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.65, margin:0, flex:1 }}>{c.body}</p>
          <div style={{ display:'flex', gap:6 }}>
            <span style={{ fontSize:11, padding:'3px 9px', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>{c.p1}</span>
            <span style={{ fontSize:11, padding:'3px 9px', borderRadius:99, background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)' }}>{c.p2}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginTop:'1rem' }}>
        <button onClick={() => go(current - 1, 'prev')} aria-label="Previous feature"
          className="btn btn-secondary" style={{ width:34, height:34, padding:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-arrow-left" style={{ fontSize:15 }} aria-hidden="true" />
        </button>
        <div style={{ display:'flex', gap:5 }}>
          {CARDS.map((_, i) => (
            <button key={i} onClick={() => go(i, i > current ? 'next' : 'prev')} aria-label={`Feature ${i + 1}`}
              style={{ width:5, height:5, borderRadius:'50%', border:'none', cursor:'pointer', padding:0, transition:'background 0.2s',
                background: i === current ? 'var(--accent)' : 'var(--border)' }} />
          ))}
        </div>
        <button onClick={() => go(current + 1, 'next')} aria-label="Next feature"
          className="btn btn-secondary" style={{ width:34, height:34, padding:0, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="ti ti-arrow-right" style={{ fontSize:15 }} aria-hidden="true" />
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
        <div style={{ position:'relative', zIndex:10, maxWidth:620, margin:'0 auto' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'5px 14px', borderRadius:99, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)', color:'var(--accent)', fontSize:12, fontWeight:500, marginBottom:'1.5rem' }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2s ease-in-out infinite' }} />
            Powered by Google Gemini — completely free
          </div>
          <h1 style={{ fontSize:'clamp(2.5rem,6vw,3.75rem)', fontWeight:700, letterSpacing:'-0.03em', color:'var(--text)', margin:'0 0 1.25rem', fontFamily:'DM Sans, Inter, sans-serif', lineHeight:1.1 }}>
            Practice interviews.<br />
            <span style={{ color:'var(--accent)' }}>Get hired faster.</span>
          </h1>
          <p style={{ fontSize:'1.05rem', color:'var(--text-muted)', lineHeight:1.75, maxWidth:460, margin:'0 auto 2.5rem' }}>
            Answer real interview questions and get structured AI feedback scored across five dimensions with actionable improvements.
          </p>
          {isLoggedIn ? (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/tracks"   className="btn btn-primary"   style={{ fontSize:14, padding:'10px 22px' }}>Choose a track</Link>
              <Link to="/practice" className="btn btn-secondary" style={{ fontSize:14, padding:'10px 22px' }}>General practice</Link>
            </div>
          ) : (
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="btn btn-primary"   style={{ fontSize:14, padding:'10px 22px' }}>Create free account</Link>
              <Link to="/login"    className="btn btn-secondary" style={{ fontSize:14, padding:'10px 22px' }}>Sign in</Link>
            </div>
          )}
          <p style={{ marginTop:'1rem', fontSize:12, color:'var(--text-subtle)' }}>No credit card required · Speech input works in Chrome and Edge</p>
        </div>
      </section>

      {/* Stats + Card deck — side by side */}
      <section style={{ background:'var(--bg-card)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', padding:'5rem 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'5rem', alignItems:'center' }}>

          {/* Stats */}
          <div>
            <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'var(--accent)', margin:'0 0 2rem' }}>By the numbers</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'1.75rem' }}>
              {STATS.map(s => (
                <div key={s.label}>
                  <div style={{ width:24, height:2, background:'var(--accent)', borderRadius:99, marginBottom:8 }} />
                  <div style={{ fontSize:'2.5rem', fontWeight:700, color:'var(--text)', lineHeight:1, fontFamily:'DM Sans, sans-serif' }}>{s.value}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card deck */}
          <CardDeck />
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ padding:'5rem 1.5rem', textAlign:'center' }}>
        <h2 style={{ fontSize:'2rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 1rem' }}>Ready to start?</h2>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem', fontSize:15 }}>Create a free account and start practicing in under a minute.</p>
        {isLoggedIn
          ? <Link to="/tracks"   className="btn btn-primary" style={{ fontSize:14, padding:'10px 22px' }}>Go to tracks</Link>
          : <Link to="/register" className="btn btn-primary" style={{ fontSize:14, padding:'10px 22px' }}>Create free account</Link>
        }
      </section>

      <Footer />
    </main>
  );
}