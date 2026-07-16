import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Footer from '../components/Footer';

const CATEGORY_OPTIONS = [
  { id: 'all',           label: 'All categories'  },
  { id: 'behavioral',    label: 'Behavioral'      },
  { id: 'technical',     label: 'Technical'       },
  { id: 'system-design', label: 'System design'   },
  { id: 'situational',   label: 'Situational'     },
  { id: 'culture-fit',   label: 'Culture fit'     },
];

const TRACK_OPTIONS = [
  { id: '',    label: 'No track (general)' },
  { id: 'swe', label: 'SWE'               },
  { id: 'ml',  label: 'ML engineer'       },
  { id: 'pm',  label: 'Product manager'   },
];

/* ── Timer ───────────────────────────────────────────────── */
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

/* ── Setup screen ────────────────────────────────────────── */
function SetupScreen({ onStart }) {
  const [numQ,     setNumQ]     = useState(5);
  const [minutes,  setMinutes]  = useState(30);
  const [category, setCategory] = useState('all');
  const [track,    setTrack]    = useState('');

  const inputStyle = { width:'100%', background:'var(--bg-subtle)', border:'1px solid var(--border)', borderRadius:8, padding:'9px 12px', fontSize:14, color:'var(--text)', outline:'none' };
  const labelStyle = { fontSize:12, fontWeight:500, color:'var(--text-muted)', display:'block', marginBottom:6 };

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', display:'flex', alignItems:'center', justifyContent:'center', padding:'3.5rem 1.5rem' }}>
      <div style={{ width:'100%', maxWidth:460 }}>
        <div style={{ marginBottom:'2rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'var(--accent-soft)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <i className="ti ti-player-play" style={{ fontSize:17, color:'var(--accent)' }} aria-hidden="true" />
            </div>
            <h1 style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:0 }}>Mock interview</h1>
          </div>
          <p style={{ fontSize:14, color:'var(--text-muted)', margin:0, lineHeight:1.6 }}>Configure your session, then answer questions under timed conditions — just like the real thing.</p>
        </div>

        <div className="card" style={{ padding:'1.75rem', display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <label style={labelStyle}>Number of questions</label>
              <input type="number" min={1} max={20} value={numQ} onChange={e => setNumQ(+e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time limit (minutes)</label>
              <input type="number" min={5} max={120} value={minutes} onChange={e => setMinutes(+e.target.value)} style={inputStyle} />
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

          <div style={{ padding:'1rem', borderRadius:10, background:'var(--accent-soft)', border:'1px solid var(--accent-glow)', display:'flex', gap:10 }}>
            <i className="ti ti-info-circle" style={{ fontSize:16, color:'var(--accent)', flexShrink:0, marginTop:1 }} aria-hidden="true" />
            <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.55 }}>
              You'll answer all questions first, then receive AI feedback on all of them at once in a final report card.
            </p>
          </div>

          <button onClick={() => onStart({ numQ, minutes, category, track })} className="btn btn-primary" style={{ fontSize:14, padding:'11px', justifyContent:'center' }}>
            <i className="ti ti-player-play" style={{ fontSize:14 }} aria-hidden="true" /> Start session
          </button>
        </div>
      </div>
    </main>
  );
}

/* ── Question screen ─────────────────────────────────────── */
function QuestionScreen({ question, index, total, answer, setAnswer, onNext, onSkip, isLast, timer }) {
  const pct    = (total > 0) ? ((index + 1) / total) * 100 : 0;
  const urgent = timer.remaining < 120;
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  return (
    <div style={{ maxWidth:680, margin:'0 auto', padding:'2rem 1.5rem' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'1.5rem', gap:16 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>Question {index + 1} of {total}</span>
            <span style={{ fontSize:12, color:'var(--text-muted)' }}>{Math.round(pct)}%</span>
          </div>
          <div style={{ height:3, borderRadius:99, background:'var(--border)' }}>
            <div style={{ height:'100%', borderRadius:99, background:'var(--accent)', width:`${pct}%`, transition:'width 0.4s ease' }} />
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:8,
          background: urgent ? 'rgba(239,68,68,0.08)' : 'var(--bg-subtle)',
          border: `1px solid ${urgent ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
          flexShrink:0 }}>
          <i className="ti ti-clock" style={{ fontSize:14, color: urgent ? '#ef4444' : 'var(--text-muted)' }} aria-hidden="true" />
          <span style={{ fontSize:13, fontFamily:'monospace', fontWeight:600, color: urgent ? '#ef4444' : 'var(--text)' }}>{timer.fmt(timer.remaining)}</span>
        </div>
      </div>

      {/* Question */}
      <div className="card" style={{ padding:'1.5rem', marginBottom:'1rem' }}>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <span className="badge" style={{ background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)', textTransform:'capitalize' }}>
            {question.category?.replace('-',' ')}
          </span>
          <span className="badge" style={{ background:'var(--bg-subtle)', color:'var(--text-muted)', border:'1px solid var(--border)', textTransform:'capitalize' }}>
            {question.difficulty}
          </span>
        </div>
        <p style={{ fontSize:16, fontWeight:600, color:'var(--text)', margin:0, lineHeight:1.5, fontFamily:'DM Sans, sans-serif' }}>{question.question}</p>
      </div>

      {/* Answer */}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <label className="label" style={{ margin:0 }}>Your answer</label>
          <span style={{ fontSize:12, fontFamily:'monospace', color: wordCount > 50 ? '#10b981' : 'var(--text-subtle)' }}>{wordCount} words</span>
        </div>
        <textarea className="textarea-answer" rows={6}
          placeholder="Type your answer here…"
          value={answer} onChange={e => setAnswer(e.target.value)} />
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:4 }}>
          <button onClick={onSkip} className="btn btn-ghost" style={{ fontSize:13, color:'var(--text-muted)' }}>
            Skip <i className="ti ti-arrow-right" style={{ fontSize:13 }} aria-hidden="true" />
          </button>
          <button onClick={onNext} disabled={answer.trim().length < 10} className="btn btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>
            {isLast ? 'Finish & get feedback' : 'Next question'}
            <i className={`ti ${isLast ? 'ti-check' : 'ti-arrow-right'}`} style={{ fontSize:13 }} aria-hidden="true" />
          </button>
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
function ReportCard({ results, config, onExport, onRetry }) {
  const navigate    = useNavigate();
  const [expanded, setExpanded] = useState(null);
  const avgScore = Math.round(results.reduce((a,r) => a + (r.feedback?.overallScore || 0), 0) / results.length);
  const color    = avgScore >= 75 ? '#10b981' : avgScore >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'2rem 1.5rem 4rem' }}>
      {/* Header */}
      <div className="card" style={{ padding:'2rem', marginBottom:'1.5rem', textAlign:'center' }}>
        <div style={{ width:80, height:80, borderRadius:'50%', border:`4px solid ${color}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' }}>
          <span style={{ fontSize:'1.75rem', fontWeight:700, color, fontFamily:'DM Sans, sans-serif' }}>{avgScore}</span>
        </div>
        <h2 style={{ fontSize:'1.5rem', fontWeight:700, color:'var(--text)', fontFamily:'DM Sans, sans-serif', margin:'0 0 6px' }}>Session complete</h2>
        <p style={{ fontSize:14, color:'var(--text-muted)', margin:'0 0 1.5rem' }}>
          {results.length} question{results.length !== 1 ? 's' : ''} · {config.minutes} min session
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, maxWidth:420, margin:'0 auto 1.5rem' }}>
          {['clarity','relevance','depth','structure','impact'].map(dim => {
            const avg = Math.round(results.reduce((a,r) => a + (r.feedback?.scores?.[dim] || 0), 0) / results.length);
            const c2  = avg >= 8 ? '#10b981' : avg >= 6 ? '#f59e0b' : '#ef4444';
            return (
              <div key={dim} style={{ textAlign:'center', padding:'10px 4px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'1.1rem', fontWeight:700, color:c2, fontFamily:'DM Sans, sans-serif' }}>{avg}</div>
                <div style={{ fontSize:10, color:'var(--text-subtle)', marginTop:2, textTransform:'capitalize' }}>{dim}</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
          <button onClick={onExport} className="btn btn-secondary" style={{ fontSize:13, padding:'8px 16px' }}>
            <i className="ti ti-download" style={{ fontSize:13 }} aria-hidden="true" /> Export PDF
          </button>
          <button onClick={onRetry} className="btn btn-secondary" style={{ fontSize:13, padding:'8px 16px' }}>
            <i className="ti ti-refresh" style={{ fontSize:13 }} aria-hidden="true" /> New session
          </button>
          <button onClick={() => navigate('/practice')} className="btn btn-primary" style={{ fontSize:13, padding:'8px 16px' }}>
            Continue practicing <i className="ti ti-arrow-right" style={{ fontSize:13 }} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Per-question breakdown */}
      <h3 style={{ fontSize:15, fontWeight:600, color:'var(--text)', margin:'0 0 1rem' }}>Question breakdown</h3>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
        {results.map((r, i) => {
          const score = r.feedback?.overallScore;
          const sc    = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
          const open  = expanded === i;
          return (
            <div key={i} className="card" style={{ overflow:'hidden' }}>
              <button onClick={() => setExpanded(open ? null : i)}
                style={{ width:'100%', padding:'1.125rem 1.25rem', display:'flex', alignItems:'center', gap:12, background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
                <span style={{ width:32, height:32, borderRadius:'50%', border:`2px solid ${sc}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:700, color:sc, fontFamily:'monospace' }}>{score || '—'}</span>
                <p style={{ fontSize:14, fontWeight:500, color:'var(--text)', margin:0, flex:1, lineHeight:1.4 }}>{r.question.question}</p>
                <i className={`ti ti-chevron-${open ? 'up' : 'down'}`} style={{ fontSize:14, color:'var(--text-subtle)', flexShrink:0 }} aria-hidden="true" />
              </button>
              {open && (
                <div style={{ padding:'0 1.25rem 1.25rem', borderTop:'1px solid var(--border)' }}>
                  <div style={{ paddingTop:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
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
                              {r.feedback.strengths?.map((s, j) => (
                                <li key={j} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:6 }}>
                                  <i className="ti ti-check" style={{ fontSize:12, color:'#10b981', flexShrink:0, marginTop:2 }} aria-hidden="true" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p style={{ fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'#f59e0b', margin:'0 0 6px' }}>To improve</p>
                            <ul style={{ margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:4 }}>
                              {r.feedback.improvements?.map((s, j) => (
                                <li key={j} style={{ fontSize:12, color:'var(--text-muted)', display:'flex', gap:6 }}>
                                  <i className="ti ti-arrow-right" style={{ fontSize:12, color:'#f59e0b', flexShrink:0, marginTop:2 }} aria-hidden="true" />{s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
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

/* ── Main page ───────────────────────────────────────────── */
const PHASES = { SETUP:'setup', INTERVIEW:'interview', ANALYSING:'analysing', REPORT:'report' };

export default function MockInterview() {
  const [phase,    setPhase]    = useState(PHASES.SETUP);
  const [config,   setConfig]   = useState(null);
  const [questions,setQuestions]= useState([]);
  const [qIndex,   setQIndex]   = useState(0);
  const [answers,  setAnswers]  = useState([]);
  const [currAns,  setCurrAns]  = useState('');
  const [results,  setResults]  = useState([]);
  const [doneCount,setDoneCount]= useState(0);

  const timer = useTimer(config ? config.minutes * 60 : 1800, () => handleFinish());

  async function handleStart(cfg) {
    setConfig(cfg);
    let qs;
    if (cfg.track) {
      const d = await api.getTrackQuestions(cfg.track, cfg.numQ);
      qs = d.questions;
    } else {
      const d = await api.getQuestions({ category: cfg.category !== 'all' ? cfg.category : undefined, limit: cfg.numQ });
      qs = d.questions;
    }
    setQuestions(qs.slice(0, cfg.numQ));
    setAnswers(Array(cfg.numQ).fill(''));
    setQIndex(0);
    setCurrAns('');
    setPhase(PHASES.INTERVIEW);
    timer.start();
  }

  function handleNext() {
    const updated = [...answers];
    updated[qIndex] = currAns;
    setAnswers(updated);
    if (qIndex < questions.length - 1) {
      setQIndex(i => i + 1);
      setCurrAns(updated[qIndex + 1] || '');
    } else {
      handleFinish(updated);
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
      handleFinish(updated);
    }
  }

  async function handleFinish(finalAnswers) {
    timer.stop();
    const ans = finalAnswers || answers;
    setPhase(PHASES.ANALYSING);
    const res = [];
    for (let i = 0; i < questions.length; i++) {
      setDoneCount(i + 1);
      const q = questions[i];
      const a = ans[i] || '';
      if (a.trim().length < 10) { res.push({ question: q, answer: a, feedback: null }); continue; }
      try {
        const d = await api.submitAnswer({ question: q.question, answer: a, category: q.category, difficulty: q.difficulty });
        res.push({ question: q, answer: a, feedback: d.feedback });
        if (localStorage.getItem('token')) {
          api.saveSession({ questionId: q.id, question: q.question, category: q.category, difficulty: q.difficulty, answer: a, feedback: d.feedback }).catch(() => {});
        }
      } catch { res.push({ question: q, answer: a, feedback: null }); }
    }
    setResults(res);
    setPhase(PHASES.REPORT);
  }

  function handleExportPDF() {
    // Trigger PDF export — handled by the PDF page
    const data = { results, config, date: new Date().toISOString() };
    sessionStorage.setItem('mock_export', JSON.stringify(data));
    window.open('/mock/export', '_blank');
  }

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem' }}>
      {phase === PHASES.SETUP     && <SetupScreen onStart={handleStart} />}
      {phase === PHASES.INTERVIEW && questions[qIndex] && (
        <div style={{ maxWidth:680, margin:'0 auto', padding:'2.5rem 1.5rem' }}>
          <QuestionScreen
            question={questions[qIndex]}
            index={qIndex}
            total={questions.length}
            answer={currAns}
            setAnswer={setCurrAns}
            onNext={handleNext}
            onSkip={handleSkip}
            isLast={qIndex === questions.length - 1}
            timer={timer}
          />
        </div>
      )}
      {phase === PHASES.ANALYSING && <AnalysingScreen done={doneCount} total={questions.length} />}
      {phase === PHASES.REPORT    && (
        <>
          <ReportCard results={results} config={config} onExport={handleExportPDF} onRetry={() => setPhase(PHASES.SETUP)} />
          <Footer />
        </>
      )}
    </main>
  );
}
