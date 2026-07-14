import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const DIMS = ['clarity','relevance','depth','structure','impact'];
const CAT_ICONS = {
  behavioral:      'ti-brain',
  technical:       'ti-code',
  'system-design': 'ti-topology-star',
  situational:     'ti-bolt',
  'culture-fit':   'ti-handshake',
};

function LineChart({ data }) {
  if (!data?.length) return <p style={{ fontSize:13, color:'var(--text-subtle)', textAlign:'center', padding:'2rem 0' }}>No data yet.</p>;
  const w=500, h=160, pad={t:10,r:10,b:30,l:32};
  const iw=w-pad.l-pad.r, ih=h-pad.t-pad.b;
  const scores = data.map(d=>d.overall_score);
  const min = Math.max(0,  Math.min(...scores)-10);
  const max = Math.min(100,Math.max(...scores)+10);
  const px = i => pad.l + (i/(data.length-1||1))*iw;
  const py = v => pad.t + ih - ((v-min)/(max-min||1))*ih;
  const pts = data.map((d,i)=>`${px(i)},${py(d.overall_score)}`).join(' ');
  const area = `M${px(0)},${py(data[0].overall_score)} ${data.map((d,i)=>`L${px(i)},${py(d.overall_score)}`).join(' ')} L${px(data.length-1)},${pad.t+ih} L${px(0)},${pad.t+ih} Z`;
  const ticks = [min,(min+max)/2,max].map(Math.round);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width:'100%' }}>
      {ticks.map(t=>(
        <g key={t}>
          <line x1={pad.l} x2={w-pad.r} y1={py(t)} y2={py(t)} stroke="var(--border)" strokeWidth="1"/>
          <text x={pad.l-5} y={py(t)+4} textAnchor="end" fontSize="9" fill="var(--text-subtle)">{t}</text>
        </g>
      ))}
      <path d={area} fill="var(--accent)" fillOpacity="0.08"/>
      <polyline points={pts} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round"/>
      {data.map((d,i)=>(
        <circle key={i} cx={px(i)} cy={py(d.overall_score)} r="3" fill="var(--accent)" stroke="var(--bg-card)" strokeWidth="1.5"/>
      ))}
      {data.map((d,i)=>{
        if(data.length>10&&i%3!==0) return null;
        return <text key={i} x={px(i)} y={h-8} textAnchor="middle" fontSize="8" fill="var(--text-subtle)">{new Date(d.created_at).toLocaleDateString('en',{month:'short',day:'numeric'})}</text>;
      })}
    </svg>
  );
}

function CategoryBars({ data }) {
  if (!data?.length) return <p style={{ fontSize:13, color:'var(--text-subtle)', textAlign:'center', padding:'2rem 0' }}>No data yet.</p>;
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      {data.map(row=>{
        const score = parseInt(row.avg_score);
        const color = score>=75?'#10b981':score>=50?'#f59e0b':'#ef4444';
        const icon  = CAT_ICONS[row.category]||'ti-chart-bar';
        return (
          <div key={row.category}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <i className={`ti ${icon}`} style={{ fontSize:14, color:'var(--text-muted)' }} aria-hidden="true"/>
                <span style={{ fontSize:13, color:'var(--text-muted)', textTransform:'capitalize' }}>{row.category.replace('-',' ')}</span>
              </div>
              <span style={{ fontSize:12, color:'var(--text-subtle)', fontFamily:'monospace' }}>avg {score} · {row.attempts} attempt{row.attempts!=='1'?'s':''}</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:99, background:color, width:`${score}%`, transition:'width 0.7s ease' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DimBars({ data }) {
  if (!data) return null;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:16 }}>
      {DIMS.map(dim=>{
        const v = parseFloat(data[dim])||0;
        const color = v>=8?'#10b981':v>=6?'#f59e0b':'#ef4444';
        return (
          <div key={dim}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
              <span style={{ fontSize:13, color:'var(--text-muted)', textTransform:'capitalize' }}>{dim}</span>
              <span style={{ fontSize:12, fontFamily:'monospace', fontWeight:600, color:'var(--text)' }}>{v}/10</span>
            </div>
            <div style={{ height:6, borderRadius:99, background:'var(--border)', overflow:'hidden' }}>
              <div style={{ height:'100%', borderRadius:99, background:color, width:`${v*10}%`, transition:'width 0.7s ease' }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyState({ icon, title, body, children }) {
  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem 1.5rem' }}>
      <div style={{ textAlign:'center', maxWidth:380 }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1.5rem' }}>
          <i className={`ti ${icon}`} style={{ fontSize:26, color:'var(--text-subtle)' }} aria-hidden="true"/>
        </div>
        <h2 style={{ fontSize:'1.25rem', fontWeight:600, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.5rem' }}>{title}</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', marginBottom:'1.5rem' }}>{body}</p>
        {children}
      </div>
    </main>
  );
}

export default function Analytics() {
  const { isLoggedIn } = useAuth();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(()=>{
    if(!isLoggedIn){ setLoading(false); return; }
    api.getAnalytics().then(setData).catch(err=>setError(err.message)).finally(()=>setLoading(false));
  },[isLoggedIn]);

  if(!isLoggedIn) return (
    <EmptyState icon="ti-lock" title="Sign in to see your analytics" body="Your progress is saved across sessions.">
      <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
        <Link to="/login"    className="btn btn-primary"   style={{ fontSize:13, padding:'8px 18px' }}>Sign in</Link>
        <Link to="/register" className="btn btn-secondary" style={{ fontSize:13, padding:'8px 18px' }}>Sign up</Link>
      </div>
    </EmptyState>
  );
  if(loading) return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>
    </main>
  );

  const s = data?.summary;
  if(!s || parseInt(s.total_sessions)===0) return (
    <EmptyState icon="ti-chart-line" title="No data yet" body="Complete some practice sessions and your analytics will appear here.">
      <Link to="/practice" className="btn btn-primary" style={{ fontSize:13, padding:'8px 18px' }}>Start practicing</Link>
    </EmptyState>
  );

  const SUMMARY = [
    { label:'Sessions',    value: s.total_sessions, icon:'ti-clipboard-list' },
    { label:'Avg score',   value: s.avg_score,      icon:'ti-chart-bar'      },
    { label:'Best score',  value: s.best_score,     icon:'ti-trophy'         },
    { label:'Worst score', value: s.worst_score,    icon:'ti-arrow-down'     },
  ];

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem' }}>
      <div style={{ maxWidth:900, margin:'0 auto', padding:'3rem 1.5rem' }}>
        <h1 style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 2rem' }}>Analytics</h1>

        {error && <p style={{ color:'#ef4444', fontSize:13, marginBottom:'1rem' }}>{error}</p>}

        {/* Summary cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:12, marginBottom:'1.5rem' }}>
          {SUMMARY.map(st=>(
            <div key={st.label} className="card" style={{ padding:'1.25rem', textAlign:'center' }}>
              <i className={`ti ${st.icon}`} style={{ fontSize:20, color:'var(--accent)', display:'block', marginBottom:8 }} aria-hidden="true"/>
              <div style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', lineHeight:1 }}>{st.value ?? '—'}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'1.25rem' }}>
          <div className="card" style={{ padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
              <i className="ti ti-trending-up" style={{ fontSize:16, color:'var(--accent)' }} aria-hidden="true"/>
              <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>Score over time</h3>
            </div>
            <LineChart data={data?.scoreHistory}/>
          </div>

          <div className="card" style={{ padding:'1.5rem' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
              <i className="ti ti-chart-bar" style={{ fontSize:16, color:'var(--accent)' }} aria-hidden="true"/>
              <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>Performance by category</h3>
            </div>
            <CategoryBars data={data?.categoryAvg}/>
          </div>

          <div className="card" style={{ padding:'1.5rem', gridColumn:'1 / -1' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'1.25rem' }}>
              <i className="ti ti-target" style={{ fontSize:16, color:'var(--accent)' }} aria-hidden="true"/>
              <h3 style={{ fontSize:14, fontWeight:600, color:'var(--text)', margin:0 }}>Average dimension scores</h3>
            </div>
            <DimBars data={data?.dimensionAvg}/>
          </div>
        </div>
      </div>
    </main>
  );
}
