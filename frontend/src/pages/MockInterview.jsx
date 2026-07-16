import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CodeEditor from '../components/CodeEditor';
import TestCaseResults from '../components/TestCaseResults';
import { useCodeRunner } from '../hooks/useCodeRunner';
import Footer from '../components/Footer';

/* ── Timer hook ──────────────────────────────────────────── */
function useTimer(totalSeconds, onExpire) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [running,   setRunning]   = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!running) return;
    ref.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) { clearInterval(ref.current); onExpire(); return 0; }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(ref.current);
  }, [running]);
  const start = () => setRunning(true);
  const stop  = () => { setRunning(false); clearInterval(ref.current); };
  const fmt   = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return { remaining, running, start, stop, fmt };
}

/* ── Fullscreen hook ─────────────────────────────────────── */
function useFullscreen(onExit) {
  const [isFs, setIsFs] = useState(false);
  const enter = () => document.documentElement.requestFullscreen?.().then(() => setIsFs(true)).catch(() => {});
  const exit  = () => document.exitFullscreen?.().then(() => setIsFs(false)).catch(() => {});
  useEffect(() => {
    const handler = () => {
      const inFs = !!document.fullscreenElement;
      setIsFs(inFs);
      if (!inFs) onExit?.();
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [onExit]);
  return { isFs, enter, exit };
}

const CATEGORY_OPTIONS = [
  { id: 'all',           label: 'All categories'   },
  { id: 'behavioral',    label: 'Behavioral'       },
  { id: 'technical',     label: 'Technical'        },
  { id: 'system-design', label: 'System design'    },
  { id: 'situational',   label: 'Situational'      },
  { id: 'culture-fit',   label: 'Culture fit'      },
];
const TRACK_OPTIONS = [
  { id: '',    label: 'No track (general)' },
  { id: 'swe', label: 'SWE'               },
  { id: 'ml',  label: 'ML engineer'       },
  { id: 'pm',  label: 'Product manager'   },
];
const PHASES = { SETUP:'setup', INTERVIEW:'interview', ANALYSING:'analysing', REPORT:'report' };

/* ── Confirm modal ───────────────────────────────────────── */
function Modal({ title, body, confirmLabel, cancelLabel, onConfirm, onCancel, danger }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div className="card" style={{ maxWidth:400, width:'100%', padding:'1.75rem' }}>
        <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 0.75rem' }}>{title}</h3>
        <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 1.5rem', lineHeight:1.6 }}>{body}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onCancel} className="btn btn-secondary" style={{ fontSize:13 }}>{cancelLabel || 'Cancel'}</button>
          <button onClick={onConfirm} className="btn btn-primary" style={{ fontSize:13, background: danger ? '#ef4444' : 'var(--accent)' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

/* ── Floating exit button — always visible, survives fullscreen quirks ── */
function FloatingExit({ onClick }) {
  return (
    <button onClick={onClick} aria-label="Exit interview"
      style={{
        position:'fixed', top:14, right:14, zIndex:10000,
        display:'flex', alignItems:'center', gap:6,
        padding:'8px 14px', borderRadius:99,
        background:'rgba(15,23,42,0.85)', color:'#fff',
        border:'1px solid rgba(255,255,255,0.15)',
        fontSize:12, fontWeight:500, cursor:'pointer',
        backdropFilter:'blur(6px)', boxShadow:'0 4px 12px rgba(0,0,0,0.25)',
      }}>
      <i className="ti ti-door-exit" style={{ fontSize:14 }} aria-hidden="true" />
      Exit
    </button>
  );
}

/* ── Fullscreen warning banner ───────────────────────────── */
function FsWarning({ onReenter }) {
  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9998, background:'rgba(239,68,68,0.95)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <i className="ti ti-alert-triangle" style={{ fontSize:18, color:'#fff' }} aria-hidden="true" />
        <span style={{ fontSize:13, color:'#fff', fontWeight:500 }}>You left fullscreen — the timer is still running. Return to fullscreen to continue.</span>
      </div>
      <button onClick={onReenter} style={{ fontSize:13, padding:'6px 14px', borderRadius:8, background:'#fff', color:'#ef4444', border:'none', cursor:'pointer', fontWeight:600, whiteSpace:'nowrap' }}>
        Re-enter fullscreen
      </button>
    </div>
  );
}

/* ── Setup screen ────────────────────────────────────────── */
function SetupScreen({ onStart }) {
  const [numQ,       setNumQ]       = useState(5);
  const [minutes,    setMinutes]    = useState(30);
  const [category,   setCategory]   = useState('all');
  const [track,      setTrack]      = useState('');
  const [includeCoding, setInclude] = useState(false);

  const inputStyle = { width:'100%', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', fontSize:14, color:'var(--text)', outline:'none' };
  const labelStyle = { fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 };

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem 1.5rem' }}>
      <div style={{ width:'100%', maxWidth:480 }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-player-play" style={{ fontSize:18, color:'var(--accent)' }} aria-hidden="true" />
            </div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:0 }}>Mock interview</h1>
          </div>
          <p style={{ fontSize:14, color:'var(--text-muted)', margin:0, lineHeight:1.65 }}>Configure your session. The interview runs in fullscreen to simulate real conditions.</p>
        </div>

        <div className="card" style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Questions</label>
              <input type="number" min={1} max={20} value={numQ} onChange={e => setNumQ(Math.max(1, Math.min(20, +e.target.value)))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time limit (min)</label>
              <input type="number" min={5} max={120} value={minutes} onChange={e => setMinutes(Math.max(5, Math.min(120, +e.target.value)))} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>
              {CATEGORY_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Role track (optional)</label>
            <select value={track} onChange={e => setTrack(e.target.value)} style={inputStyle}>
              {TRACK_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
          </div>

          {/* Include coding questions toggle */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:12, padding:'12px 14px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
            <button onClick={() => setInclude(v => !v)} aria-label="Toggle coding questions"
              style={{ width:36, height:20, borderRadius:99, border:'none', cursor:'pointer', flexShrink:0, marginTop:2, transition:'background 0.2s',
                background: includeCoding ? 'var(--accent)' : 'var(--border)', position:'relative' }}>
              <span style={{ position:'absolute', top:2, left: includeCoding ? 18 : 2, width:16, height:16, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }} />
            </button>
            <div>
              <p style={{ fontSize:13, fontWeight:500, color:'var(--text)', margin:'0 0 2px' }}>Include coding questions</p>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>Mix in LeetCode-style problems with test case validation (JS and Python)</p>
            </div>
          </div>

          <div style={{ padding:'10px 14px', borderRadius:10, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)', display:'flex', gap:10 }}>
            <i className="ti ti-info-circle" style={{ fontSize:15, color:'var(--accent)', flexShrink:0, marginTop:1 }} aria-hidden="true" />
            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.55 }}>
              Runs in fullscreen. The timer keeps running if you exit fullscreen. You can exit early and get a partial report.
            </p>
          </div>

          <button onClick={() => onStart({ numQ, minutes, category, track, includeCoding })} className="btn btn-primary" style={{ fontSize:14, padding:'11px', justifyContent:'center' }}>
            <i className="ti ti-player-play" style={{ fontSize:14 }} aria-hidden="true" /> Start session
          </button>
        </div>
      </div>
    </main>
  );
}

/* ── Coding question screen ──────────────────────────────── */
function CodingScreen({ problem, index, total, onNext, onSkip, isLast, timer, onExit }) {
  const [lang,    setLang]    = useState('javascript');
  const [code,    setCode]    = useState(problem.starterCode?.javascript || '');
  const [cases,   setCases]   = useState(null);
  const { run, reset, results, running, complexity, pyLoading } = useCodeRunner();
  const urgent = timer.remaining < 120;

  useEffect(() => {
    fetch(`/api/coding/${problem.id}/cases`)
      .then(r => r.json())
      .then(setCases);
    setCode(problem.starterCode?.[lang] || '');
    reset();
  }, [problem.id]);

  useEffect(() => {
    setCode(problem.starterCode?.[lang] || '');
    reset();
  }, [lang]);

  const handleRun = () => {
    if (!cases) return;
    run({ code, language: lang, testCases: cases.testCases, runnerJs: cases.runnerJs, runnerPy: cases.runnerPy, optimalComplexity: cases.optimalComplexity });
  };

  const allPassed = results?.every(r => r.passed);
  const pct = (total > 0) ? ((index + 1) / total) * 100 : 0;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)', overflow:'hidden' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', height:52, borderBottom:'1px solid var(--border)', background:'var(--bg-card)', flexShrink:0, gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
          <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>Q{index+1}/{total}</span>
          <div style={{ flex:1, maxWidth:200, height:3, borderRadius:99, background:'var(--border)' }}>
            <div style={{ height:'100%', borderRadius:99, background:'var(--accent)', width:`${pct}%`, transition:'width 0.4s' }} />
          </div>
          <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)', whiteSpace:'nowrap' }}>Coding</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:8,
            background: urgent?'rgba(239,68,68,0.08)':'var(--bg-subtle)', border:`1px solid ${urgent?'rgba(239,68,68,0.2)':'var(--border)'}` }}>
            <i className="ti ti-clock" style={{ fontSize:14, color:urgent?'#ef4444':'var(--text-muted)' }} aria-hidden="true" />
            <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:600, color:urgent?'#ef4444':'var(--text)' }}>{timer.fmt(timer.remaining)}</span>
          </div>
          <button onClick={onExit} className="btn btn-ghost" style={{ fontSize:12, color:'var(--text-muted)', padding:'5px 10px' }}>
            <i className="ti ti-door-exit" style={{ fontSize:14 }} aria-hidden="true" /> Exit
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', overflow:'hidden' }}>
        {/* Left: problem */}
        <div style={{ overflow:'auto', padding:'1.5rem', borderRight:'1px solid var(--border)' }}>
          <div style={{ display:'flex', gap:8, marginBottom:12 }}>
            <span className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)', textTransform:'capitalize' }}>{problem.difficulty}</span>
          </div>
          <h2 style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 1rem' }}>{problem.question}</h2>
          <p style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.7, margin:'0 0 1.25rem', whiteSpace:'pre-line' }}>{problem.description}</p>

          {problem.examples?.map((ex, i) => (
            <div key={i} style={{ marginBottom:'0.75rem', padding:'10px 14px', borderRadius:9, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
              <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 6px' }}>Example {i+1}</p>
              <code style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:2 }}>Input: {ex.input}</code>
              <code style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom: ex.explanation ? 2 : 0 }}>Output: {ex.output}</code>
              {ex.explanation && <p style={{ fontSize:12, color:'var(--text-subtle)', margin:'4px 0 0' }}>{ex.explanation}</p>}
            </div>
          ))}

          {problem.tips?.length > 0 && (
            <div style={{ padding:'10px 14px', borderRadius:9, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)', marginTop:'0.75rem' }}>
              <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--accent)', margin:'0 0 6px' }}>Hints</p>
              <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                {problem.tips.map((t, i) => (
                  <li key={i} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:6 }}>
                    <span style={{ color:'var(--accent)' }}>·</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right: editor + results */}
        <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Language selector */}
          <div style={{ padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--bg-card)', flexShrink:0 }}>
            <div style={{ display:'flex', borderRadius:7, border:'1px solid var(--border)', overflow:'hidden' }}>
              {['javascript','python'].map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{ fontSize:12, padding:'4px 12px', border:'none', cursor:'pointer', transition:'all 0.15s', textTransform:'capitalize',
                    background: lang===l?'var(--accent)':'var(--bg-subtle)', color: lang===l?'#fff':'var(--text-muted)' }}>
                  {l === 'javascript' ? 'JavaScript' : 'Python'}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={handleRun} disabled={running || pyLoading} className="btn btn-secondary" style={{ fontSize:12, padding:'5px 14px' }}>
                {running || pyLoading ? <><span style={{ width:12, height:12, border:'2px solid var(--border)', borderTopColor:'var(--accent)', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} /> Running</> : <><i className="ti ti-player-play" style={{ fontSize:12 }} /> Run tests</>}
              </button>
              <button onClick={() => { onNext(code, lang, results); }}
                className="btn btn-primary" style={{ fontSize:12, padding:'5px 14px', background: allPassed ? '#10b981' : 'var(--accent)' }}>
                {isLast ? 'Finish' : 'Next'} <i className={`ti ${isLast?'ti-check':'ti-arrow-right'}`} style={{ fontSize:12 }} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div style={{ flex:1, overflow:'auto', padding:'0.75rem' }}>
            <CodeEditor value={code} onChange={setCode} language={lang} height={280} />
          </div>

          {/* Test results */}
          {(results || running || pyLoading) && (
            <div style={{ maxHeight:240, overflow:'auto', padding:'0.75rem', borderTop:'1px solid var(--border)', flexShrink:0 }}>
              <TestCaseResults results={results} complexity={complexity} running={running} pyLoading={pyLoading} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Regular question screen ─────────────────────────────── */
function QuestionScreen({ question, index, total, answer, setAnswer, onNext, onSkip, isLast, timer, onExit }) {
  const pct    = (total > 0) ? ((index + 1) / total) * 100 : 0;
  const urgent = timer.remaining < 120;
  const words  = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', background:'var(--bg)' }}>
      {/* Top bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 1.5rem', height:52, borderBottom:'1px solid var(--border)', background:'var(--bg-card)', flexShrink:0, gap:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
          <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>Q{index+1}/{total}</span>
          <div style={{ flex:1, maxWidth:200, height:3, borderRadius:99, background:'var(--border)' }}>
            <div style={{ height:'100%', borderRadius:99, background:'var(--accent)', width:`${pct}%`, transition:'width 0.4s' }} />
          </div>
          <span className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)', textTransform:'capitalize', whiteSpace:'nowrap' }}>
            {question.category?.replace('-',' ')} · {question.difficulty}
          </span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:8,
            background: urgent?'rgba(239,68,68,0.08)':'var(--bg-subtle)', border:`1px solid ${urgent?'rgba(239,68,68,0.2)':'var(--border)'}` }}>
            <i className="ti ti-clock" style={{ fontSize:14, color:urgent?'#ef4444':'var(--text-muted)' }} aria-hidden="true" />
            <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:600, color:urgent?'#ef4444':'var(--text)' }}>{timer.fmt(timer.remaining)}</span>
          </div>
          <button onClick={onSkip} className="btn btn-ghost" style={{ fontSize:12, color:'var(--text-muted)', padding:'5px 10px' }}>
            Skip
          </button>
          <button onClick={onExit} className="btn btn-ghost" style={{ fontSize:12, color:'var(--text-muted)', padding:'5px 10px' }}>
            <i className="ti ti-door-exit" style={{ fontSize:14 }} aria-hidden="true" /> Exit
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex:1, overflow:'auto', display:'flex', flexDirection:'column' }}>
        <div style={{ maxWidth:680, width:'100%', margin:'0 auto', padding:'2rem 1.5rem', flex:1, display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card" style={{ padding:'1.5rem' }}>
            <p style={{ fontSize:17, fontWeight:600, color:'var(--text)', margin:0, lineHeight:1.5, fontFamily:'DM Sans, sans-serif' }}>{question.question}</p>
          </div>
          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <label className="label" style={{ margin:0 }}>Your answer</label>
              <span style={{ fontSize:12, fontFamily:'monospace', color: words>50?'#10b981':'var(--text-subtle)' }}>{words} words</span>
            </div>
            <textarea className="textarea-answer" style={{ flex:1, minHeight:200, resize:'none' }}
              placeholder="Type your answer here…"
              value={answer} onChange={e => setAnswer(e.target.value)} />
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => onNext(answer)} disabled={answer.trim().length < 10} className="btn btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>
                {isLast ? 'Finish & get feedback' : 'Next question'}
                <i className={`ti ${isLast?'ti-check':'ti-arrow-right'}`} style={{ fontSize:13 }} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Analysing screen ────────────────────────────────────── */
function AnalysingScreen({ done, total }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1.5rem' }}>
      <div style={{ width:48, height:48, border:'3px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.9s linear infinite' }} />
      <div style={{ textAlign:'center' }}>
        <h2 style={{ fontSize:'1.25rem', fontWeight:600, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 6px' }}>Analysing your answers</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', margin:0 }}>Getting feedback on answer {done} of {total}…</p>
      </div>
    </div>
  );
}

/* ── Report card ─────────────────────────────────────────── */
function ReportCard({ results, config, onRetry }) {
  const navigate    = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const textResults = results.filter(r => !r.isCoding);
  const codeResults = results.filter(r => r.isCoding);
  const avgScore    = textResults.length
    ? Math.round(textResults.reduce((a, r) => a + (r.feedback?.overallScore || 0), 0) / textResults.length)
    : null;
  const codeScore   = codeResults.length
    ? Math.round(codeResults.reduce((a, r) => a + (r.testsPassed / r.testsTotal * 100), 0) / codeResults.length)
    : null;
  const color = (s) => s >= 75 ? '#10b981' : s >= 50 ? '#f59e0b' : '#ef4444';

  function handleExport() {
    sessionStorage.setItem('mock_export', JSON.stringify({ results, config, date: new Date().toISOString() }));
    window.open('/mock/export', '_blank');
  }

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'2rem 1.5rem 4rem' }}>
      {/* Summary */}
      <div className="card" style={{ padding:'2rem', marginBottom:'1.5rem', textAlign:'center' }}>
        <div style={{ display:'flex', gap:16, justifyContent:'center', marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {avgScore !== null && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', border:`4px solid ${color(avgScore)}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px' }}>
                <span style={{ fontSize:'1.5rem', fontWeight:700, color:color(avgScore), fontFamily:'DM Sans, sans-serif' }}>{avgScore}</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>Interview score</p>
            </div>
          )}
          {codeScore !== null && (
            <div style={{ textAlign:'center' }}>
              <div style={{ width:72, height:72, borderRadius:'50%', border:`4px solid ${color(codeScore)}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 6px' }}>
                <span style={{ fontSize:'1.5rem', fontWeight:700, color:color(codeScore), fontFamily:'DM Sans, sans-serif' }}>{codeScore}%</span>
              </div>
              <p style={{ fontSize:12, color:'var(--text-muted)', margin:0 }}>Code score</p>
            </div>
          )}
        </div>
        <h2 style={{ fontSize:'1.4rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 6px' }}>Session complete</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 1.5rem' }}>
          {results.length} question{results.length!==1?'s':''} · {config.minutes} min
        </p>

        {textResults.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, maxWidth:380, margin:'0 auto 1.5rem' }}>
            {['clarity','relevance','depth','structure','impact'].map(dim => {
              const avg = Math.round(textResults.reduce((a,r) => a+(r.feedback?.scores?.[dim]||0),0)/textResults.length);
              return (
                <div key={dim} style={{ padding:'10px 4px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', textAlign:'center' }}>
                  <div style={{ fontSize:'1.1rem', fontWeight:700, color:color(avg*10), fontFamily:'DM Sans, sans-serif' }}>{avg}</div>
                  <div style={{ fontSize:10, color:'var(--text-subtle)', marginTop:2, textTransform:'capitalize' }}>{dim}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={handleExport} className="btn btn-secondary" style={{ fontSize:13 }}>
            <i className="ti ti-download" style={{ fontSize:13 }} /> Export PDF
          </button>
          <button onClick={onRetry} className="btn btn-secondary" style={{ fontSize:13 }}>
            <i className="ti ti-refresh" style={{ fontSize:13 }} /> New session
          </button>
          <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ fontSize:13 }}>
            Continue practicing <i className="ti ti-arrow-right" style={{ fontSize:13 }} />
          </button>
        </div>
      </div>

      {/* Breakdown */}
      <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', margin:'0 0 1rem' }}>Question breakdown</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {results.map((r, i) => {
          const open = expanded === i;
          const sc   = r.isCoding
            ? color(r.testsPassed/r.testsTotal*100)
            : color(r.feedback?.overallScore || 0);
          const scoreLabel = r.isCoding
            ? `${r.testsPassed}/${r.testsTotal} tests`
            : (r.feedback?.overallScore || '—');

          return (
            <div key={i} className="card" style={{ overflow:'hidden' }}>
              <button onClick={() => setExpanded(open?null:i)}
                style={{ width:'100%', padding:'1rem 1.25rem', display:'flex', alignItems:'center', gap:12, background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                <span style={{ width:36, height:36, borderRadius:'50%', border:`2px solid ${sc}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:11, fontWeight:700, color:sc, fontFamily:'monospace', whiteSpace:'nowrap', padding:'0 2px' }}>
                  {scoreLabel}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', margin:'0 0 2px', lineHeight:1.4 }}>{r.question.question}</p>
                  {r.isCoding && <span style={{ fontSize:11, padding:'2px 7px', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>Coding · {r.lang}</span>}
                </div>
                <i className={`ti ti-chevron-${open?'up':'down'}`} style={{ fontSize:14, color:'var(--text-subtle)', flexShrink:0 }} aria-hidden="true" />
              </button>

              {open && (
                <div style={{ padding:'0 1.25rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                  <div style={{ paddingTop:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                    {r.isCoding ? (
                      <>
                        <div>
                          <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 6px' }}>Your code ({r.lang})</p>
                          <pre style={{ margin:0, padding:'10px 14px', borderRadius:9, background:'var(--bg-subtle)', border:'1px solid var(--border)', fontSize:12, color:'var(--text-muted)', overflowX:'auto', fontFamily:'monospace', lineHeight:1.6 }}>{r.answer || 'No code submitted'}</pre>
                        </div>
                        <div style={{ display:'flex', gap:8 }}>
                          {r.complexity && (
                            <>
                              <div style={{ flex:1, padding:'8px 12px', borderRadius:9, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
                                <p style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-subtle)', margin:'0 0 3px' }}>Time complexity</p>
                                <p style={{ fontSize:13, fontFamily:'monospace', color:'var(--text)', margin:0 }}>{r.complexity.estimated?.time}</p>
                              </div>
                              <div style={{ flex:1, padding:'8px 12px', borderRadius:9, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
                                <p style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', color:'var(--text-subtle)', margin:'0 0 3px' }}>Space complexity</p>
                                <p style={{ fontSize:13, fontFamily:'monospace', color:'var(--text)', margin:0 }}>{r.complexity.estimated?.space}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 6px' }}>Your answer</p>
                          <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.6 }}>{r.answer || <em>Skipped</em>}</p>
                        </div>
                        {r.feedback && (
                          <>
                            <div>
                              <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 6px' }}>Summary</p>
                              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.6 }}>{r.feedback.summary}</p>
                            </div>
                            {r.feedback.keyTakeaway && (
                              <div style={{ padding:'10px 14px', borderRadius:9, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)' }}>
                                <span style={{ fontSize:12, fontWeight:600, color:'var(--accent)' }}>Key takeaway: </span>
                                <span style={{ fontSize:13, color:'var(--text-muted)' }}>{r.feedback.keyTakeaway}</span>
                              </div>
                            )}
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              <div>
                                <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#10b981', margin:'0 0 6px' }}>Strengths</p>
                                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                                  {r.feedback.strengths?.map((s,j) => (
                                    <li key={j} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:6 }}>
                                      <i className="ti ti-check" style={{ fontSize:12, color:'#10b981', flexShrink:0, marginTop:2 }} />{s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#f59e0b', margin:'0 0 6px' }}>To improve</p>
                                <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                                  {r.feedback.improvements?.map((s,j) => (
                                    <li key={j} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:6 }}>
                                      <i className="ti ti-arrow-right" style={{ fontSize:12, color:'#f59e0b', flexShrink:0, marginTop:2 }} />{s}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────── */
export default function MockInterview() {
  const [phase,      setPhase]      = useState(PHASES.SETUP);
  const [config,     setConfig]     = useState(null);
  const [questions,  setQuestions]  = useState([]);
  const [qIndex,     setQIndex]     = useState(0);
  const [answers,    setAnswers]    = useState([]);
  const [currAns,    setCurrAns]    = useState('');
  const [results,    setResults]    = useState([]);
  const [doneCount,  setDoneCount]  = useState(0);
  const [showExit,   setShowExit]   = useState(false);
  const [fsWarning,  setFsWarning]  = useState(false);

  const onFsExit  = useCallback(() => { if (phase === PHASES.INTERVIEW) setFsWarning(true); }, [phase]);
  const { isFs, enter, exit: exitFs } = useFullscreen(onFsExit);
  const timer = useTimer(config ? config.minutes * 60 : 1800, () => finishSession());

  // ESC key also opens the exit confirmation, as a reliable fallback
  useEffect(() => {
    if (phase !== PHASES.INTERVIEW) return;
    const handler = (e) => {
      if (e.key === 'Escape') setShowExit(true);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase]);

  async function handleStart(cfg) {
    setConfig(cfg);
    let qs = [];

    // Fetch regular questions
    if (cfg.track) {
      const d = await api.getTrackQuestions(cfg.track, 50);
      qs = d.questions;
      if (cfg.category && cfg.category !== 'all') qs = qs.filter(q => q.category === cfg.category);
    } else {
      const d = await api.getQuestions({ category: cfg.category !== 'all' ? cfg.category : undefined, limit: 50 });
      qs = d.questions;
    }
    qs = qs.sort(() => Math.random() - 0.5);

    // Mix in coding questions if enabled
    let finalQs = [];
    if (cfg.includeCoding) {
      const codeCount = Math.max(1, Math.floor(cfg.numQ * 0.3)); // ~30% coding
      const textCount = cfg.numQ - codeCount;
      const d = await fetch('/api/coding').then(r => r.json());
      const codeQs = d.problems.sort(() => Math.random() - 0.5).slice(0, codeCount).map(p => ({ ...p, isCoding: true }));
      finalQs = [...qs.slice(0, textCount), ...codeQs].sort(() => Math.random() - 0.5);
    } else {
      finalQs = qs.slice(0, cfg.numQ);
    }

    if (finalQs.length === 0) {
      alert('No questions match that combination. Try "All categories".');
      return;
    }

    setQuestions(finalQs);
    setAnswers(Array(finalQs.length).fill(''));
    setQIndex(0);
    setCurrAns('');
    setPhase(PHASES.INTERVIEW);
    timer.start();
    enter(); // request fullscreen
  }

  function handleNextText(answer) {
    const updated = [...answers];
    updated[qIndex] = answer;
    setAnswers(updated);
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setCurrAns(updated[qIndex + 1] || '');
    } else {
      finishSession(updated);
    }
  }

  function handleNextCode(code, lang, testResults) {
    const updated = [...answers];
    updated[qIndex] = { code, lang, testResults };
    setAnswers(updated);
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setCurrAns(updated[qIndex + 1] || '');
    } else {
      finishSession(updated);
    }
  }

  function handleSkip() {
    const updated = [...answers];
    updated[qIndex] = '';
    setAnswers(updated);
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setCurrAns(updated[qIndex + 1] || '');
    } else {
      finishSession(updated);
    }
  }

  async function finishSession(finalAnswers) {
    timer.stop();
    exitFs();
    const ans = finalAnswers || answers;
    setPhase(PHASES.ANALYSING);
    const res = [];

    for (let i = 0; i < questions.length; i++) {
      setDoneCount(i + 1);
      const q = questions[i];
      const a = ans[i];

      if (q.isCoding) {
        const codeAns = typeof a === 'object' ? a : { code: '', lang: 'javascript', testResults: null };
        const passed  = codeAns.testResults?.filter(r => r.passed).length || 0;
        const total   = codeAns.testResults?.length || 0;
        res.push({ question: q, answer: codeAns.code, lang: codeAns.lang, isCoding: true,
          testsPassed: passed, testsTotal: total, complexity: null, feedback: null });
        continue;
      }

      const ansText = typeof a === 'string' ? a : '';
      if (ansText.trim().length < 10) {
        res.push({ question: q, answer: ansText, feedback: null, isCoding: false });
        continue;
      }
      try {
        const d = await api.submitAnswer({ question: q.question, answer: ansText, category: q.category, difficulty: q.difficulty });
        res.push({ question: q, answer: ansText, feedback: d.feedback, isCoding: false });
        if (localStorage.getItem('token')) {
          api.saveSession({ questionId: q.id, question: q.question, category: q.category, difficulty: q.difficulty, answer: ansText, feedback: d.feedback }).catch(() => {});
        }
      } catch {
        res.push({ question: q, answer: ansText, feedback: null, isCoding: false });
      }
    }

    setResults(res);
    setPhase(PHASES.REPORT);
  }

  const currentQ = questions[qIndex];

  return (
    <>
      {/* Floating exit — always visible during interview, independent of layout */}
      {phase === PHASES.INTERVIEW && (
        <FloatingExit onClick={() => setShowExit(true)} />
      )}

      {/* Fullscreen warning banner */}
      {fsWarning && phase === PHASES.INTERVIEW && (
        <FsWarning onReenter={() => { enter(); setFsWarning(false); }} />
      )}

      {/* Exit confirmation modal */}
      {showExit && (
        <Modal
          title="Exit session"
          body="You will go straight to the report card with the questions you have answered so far. Any unanswered questions will be skipped."
          confirmLabel="Exit and see report"
          cancelLabel="Continue interview"
          danger
          onConfirm={() => { setShowExit(false); finishSession(); }}
          onCancel={() => setShowExit(false)}
        />
      )}

      <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop: phase === PHASES.INTERVIEW ? 0 : '3.5rem' }}>
        {phase === PHASES.SETUP && <SetupScreen onStart={handleStart} />}

        {phase === PHASES.INTERVIEW && currentQ && (
          currentQ.isCoding ? (
            <CodingScreen
              problem={currentQ}
              index={qIndex}
              total={questions.length}
              onNext={handleNextCode}
              onSkip={handleSkip}
              isLast={qIndex === questions.length - 1}
              timer={timer}
              onExit={() => setShowExit(true)}
            />
          ) : (
            <QuestionScreen
              question={currentQ}
              index={qIndex}
              total={questions.length}
              answer={currAns}
              setAnswer={setCurrAns}
              onNext={handleNextText}
              onSkip={handleSkip}
              isLast={qIndex === questions.length - 1}
              timer={timer}
              onExit={() => setShowExit(true)}
            />
          )
        )}

        {phase === PHASES.ANALYSING && <AnalysingScreen done={doneCount} total={questions.length} />}

        {phase === PHASES.REPORT && (
          <>
            <ReportCard results={results} config={config} onRetry={() => { setPhase(PHASES.SETUP); setResults([]); }} />
            <Footer />
          </>
        )}
      </main>
    </>
  );
}
