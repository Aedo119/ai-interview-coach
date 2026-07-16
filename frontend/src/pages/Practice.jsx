import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { useSpeech }    from '../hooks/useSpeech';
import QuestionCard     from '../components/QuestionCard';
import FeedbackPanel    from '../components/FeedbackPanel';
import ProgressBar      from '../components/ProgressBar';
import SpeechButton     from '../components/SpeechButton';
import CodeEditor       from '../components/CodeEditor';
import { api }          from '../utils/api';

const CATEGORIES = [
  { id:'all',           label:'All'           },
  { id:'behavioral',    label:'Behavioral'    },
  { id:'technical',     label:'Technical'     },
  { id:'system-design', label:'System design' },
  { id:'situational',   label:'Situational'   },
  { id:'culture-fit',   label:'Culture fit'   },
];

const LANG_OPTIONS = [
  { id:'javascript', label:'JavaScript' },
  { id:'python',     label:'Python'     },
  { id:'text',       label:'Plain text' },
];

export default function Practice() {
  const [searchParams]   = useSearchParams();
  const trackId          = searchParams.get('track');

  const { currentQuestion, currentIndex, totalQuestions, answer, feedback, isLoading, isLoadingQ, error,
    selectedCategory, setAnswer, setSelectedCategory, loadQuestions, submitAnswer, nextQuestion, skipQuestion } = useInterview();

  const [showTips,   setShowTips]   = useState(false);
  const [trackInfo,  setTrackInfo]  = useState(null);
  const [codeMode,   setCodeMode]   = useState(false);
  const [lang,       setLang]       = useState('javascript');
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const isTechnical = ['technical','system-design'].includes(currentQuestion?.category);

  const handleTranscript = useCallback(text => {
    setAnswer(prev => { const t = prev.trimEnd(); return t ? `${t} ${text}` : text; });
  }, [setAnswer]);

  const speech = useSpeech({ onTranscript: handleTranscript });

  useEffect(() => {
    if (trackId) {
      api.getTrackQuestions(trackId, 10)
        .then(d => { setTrackInfo(d.track); loadQuestions({ trackId, limit: 10 }); })
        .catch(() => loadQuestions({ limit: 10 }));
    } else { loadQuestions({ limit: 10 }); }
  }, [trackId]);

  useEffect(() => { if (feedback && speech.isListening) speech.stop(); }, [feedback]);
  useEffect(() => { setCodeMode(false); setAnswer(''); }, [currentQuestion?.id]);

  const handleKeyDown = e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && answer.trim().length >= 20 && !feedback) submitAnswer();
    }
  };

  if (isLoadingQ) return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:36, height:36, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', margin:'0 auto 1rem' }} />
        <p style={{ fontSize:13, color:'var(--text-muted)' }}>Loading questions…</p>
      </div>
    </main>
  );

  return (
    <main style={{ background:'var(--bg)', minHeight:'100vh', paddingTop:'3.5rem', paddingBottom:'5rem' }}>
      <div style={{ maxWidth:680, margin:'0 auto', padding:'2.5rem 1.5rem' }}>

        {/* Track badge or category pills */}
        {trackInfo ? (
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'1.5rem' }}>
            <span style={{ fontSize:12, fontWeight:500, padding:'4px 12px', borderRadius:99, background:'var(--accent-soft)', color:'var(--accent)', border:'1px solid var(--accent-glow)' }}>
              {trackInfo.label} track
            </span>
            <a href="/practice" style={{ fontSize:12, color:'var(--text-subtle)', textDecoration:'none' }}>
              <i className="ti ti-arrow-left" style={{ fontSize:12 }} aria-hidden="true" /> General practice
            </a>
          </div>
        ) : (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:'1.5rem' }}>
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setSelectedCategory(cat.id); loadQuestions({ category: cat.id, limit: 10 }); }}
                style={{ fontSize:12, fontWeight:500, padding:'5px 13px', borderRadius:99, cursor:'pointer',
                  background: selectedCategory===cat.id?'var(--accent)':'var(--bg-subtle)',
                  color:      selectedCategory===cat.id?'#fff':'var(--text-muted)',
                  border:     selectedCategory===cat.id?'1px solid var(--accent)':'1px solid var(--border)',
                  transition:'all 0.15s' }}>
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {totalQuestions > 0 && <div style={{ marginBottom:'1.25rem' }}><ProgressBar current={currentIndex} total={totalQuestions} /></div>}

        {currentQuestion ? (
          <>
            <QuestionCard question={currentQuestion} showTips={showTips} />

            {!feedback && (
              <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
                {/* Answer mode toggle for technical questions */}
                {isTechnical && (
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)' }}>Answer mode:</span>
                    <div style={{ display:'flex', borderRadius:8, border:'1px solid var(--border)', overflow:'hidden' }}>
                      {[{id:false,label:'Text'},{id:true,label:'Code'}].map(m => (
                        <button key={String(m.id)} onClick={() => setCodeMode(m.id)}
                          style={{ fontSize:12, padding:'4px 12px', border:'none', cursor:'pointer', transition:'all 0.15s',
                            background: codeMode===m.id ? 'var(--accent)' : 'var(--bg-subtle)',
                            color:      codeMode===m.id ? '#fff' : 'var(--text-muted)' }}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                    {codeMode && (
                      <select value={lang} onChange={e => setLang(e.target.value)}
                        style={{ fontSize:12, padding:'4px 10px', borderRadius:7, border:'1px solid var(--border)', background:'var(--bg-subtle)', color:'var(--text-muted)', cursor:'pointer' }}>
                        {LANG_OPTIONS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                      </select>
                    )}
                  </div>
                )}

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <label className="label" style={{ margin:0 }}>Your answer</label>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <button onClick={() => setShowTips(t => !t)}
                      style={{ fontSize:12, color:'var(--accent)', background:'none', border:'none', cursor:'pointer', padding:0 }}>
                      {showTips ? 'Hide tips' : 'Show tips'}
                    </button>
                    {!codeMode && (
                      <span style={{ fontSize:12, fontFamily:'monospace', color: wordCount>50?'#10b981':'var(--text-subtle)' }}>{wordCount} words</span>
                    )}
                  </div>
                </div>

                {codeMode ? (
                  <CodeEditor value={answer} onChange={setAnswer} language={lang} height={280} />
                ) : (
                  <textarea className="textarea-answer"
                    placeholder="Type your answer, or use the microphone below…"
                    value={answer} onChange={e => setAnswer(e.target.value)}
                    onKeyDown={handleKeyDown} disabled={isLoading} rows={6} />
                )}

                {!codeMode && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                    <SpeechButton isListening={speech.isListening} isSupported={speech.isSupported}
                      interimText={speech.interimText} error={speech.error} onToggle={speech.toggle} />
                    {speech.isListening && (
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#ef4444' }}>
                        <span style={{ width:6, height:6, borderRadius:'50%', background:'#ef4444', animation:'pulse 1.5s ease-in-out infinite' }} />
                        Recording
                      </div>
                    )}
                  </div>
                )}

                {error && <div style={{ padding:'10px 14px', borderRadius:10, background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', fontSize:13, color:'#ef4444' }}>{error}</div>}

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', paddingTop:4 }}>
                  <button onClick={skipQuestion} className="btn btn-ghost" style={{ fontSize:13, color:'var(--text-muted)' }}>
                    Skip <i className="ti ti-arrow-right" style={{ fontSize:13 }} aria-hidden="true" />
                  </button>
                  <button onClick={submitAnswer} disabled={isLoading || answer.trim().length < 10} className="btn btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>
                    {isLoading ? (
                      <><span style={{ width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} /> Analysing…</>
                    ) : (
                      <>Get feedback <kbd style={{ fontSize:10, opacity:0.5, fontFamily:'monospace', marginLeft:4 }}>⌘↵</kbd></>
                    )}
                  </button>
                </div>
                {answer.trim().length > 0 && answer.trim().length < 10 && (
                  <p style={{ fontSize:12, color:'var(--text-subtle)', textAlign:'right', margin:0 }}>Answer needs to be a bit longer</p>
                )}
              </div>
            )}

            {feedback && (
              <div style={{ marginTop:'1rem', display:'flex', flexDirection:'column', gap:'1rem' }}>
                <FeedbackPanel feedback={feedback} />
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={nextQuestion} className="btn btn-primary" style={{ fontSize:13, padding:'9px 20px' }}>
                    Next question <i className="ti ti-arrow-right" style={{ fontSize:13 }} aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card" style={{ padding:'3rem', textAlign:'center' }}>
            <p style={{ color:'var(--text-muted)', marginBottom:'1rem', fontSize:14 }}>No questions loaded.</p>
            <button onClick={() => loadQuestions()} className="btn btn-primary" style={{ fontSize:13 }}>Load questions</button>
          </div>
        )}
      </div>
    </main>
  );
}
