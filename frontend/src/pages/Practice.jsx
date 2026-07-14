import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInterview } from '../hooks/useInterview';
import { useSpeech }    from '../hooks/useSpeech';
import QuestionCard     from '../components/QuestionCard';
import FeedbackPanel    from '../components/FeedbackPanel';
import ProgressBar      from '../components/ProgressBar';
import SpeechButton     from '../components/SpeechButton';
import { api }          from '../utils/api';

const CATEGORIES = [
  { id: 'all',            label: 'All',           icon: '📋' },
  { id: 'behavioral',     label: 'Behavioral',    icon: '🧠' },
  { id: 'technical',      label: 'Technical',     icon: '💻' },
  { id: 'system-design',  label: 'System Design', icon: '🏗️' },
  { id: 'situational',    label: 'Situational',   icon: '⚡' },
  { id: 'culture-fit',    label: 'Culture Fit',   icon: '🤝' },
];

export default function Practice() {
  const [searchParams] = useSearchParams();
  const trackId        = searchParams.get('track');

  const {
    currentQuestion, currentIndex, totalQuestions,
    answer, feedback, isLoading, isLoadingQ, error,
    selectedCategory, setAnswer, setSelectedCategory,
    loadQuestions, submitAnswer, nextQuestion, skipQuestion,
  } = useInterview();

  const [showTips, setShowTips]     = useState(false);
  const [trackInfo, setTrackInfo]   = useState(null);
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleTranscript = useCallback((text) => {
    setAnswer(prev => { const t = prev.trimEnd(); return t ? `${t} ${text}` : text; });
  }, [setAnswer]);

  const speech = useSpeech({ onTranscript: handleTranscript });

  useEffect(() => {
    if (trackId) {
      api.getTrackQuestions(trackId, 10).then(data => {
        setTrackInfo(data.track);
        // Inject track questions into the interview hook via loadQuestions override
        loadQuestions({ trackId, limit: 10 });
      }).catch(() => loadQuestions({ limit: 10 }));
    } else {
      loadQuestions({ limit: 10 });
    }
  }, [trackId]);

  useEffect(() => { if (feedback && speech.isListening) speech.stop(); }, [feedback]);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    loadQuestions({ category: catId, limit: 10 });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && answer.trim().length >= 20 && !feedback) submitAnswer();
    }
  };

  if (isLoadingQ) return (
    <main className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading questions…</p>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen pt-14 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Track badge or category filter */}
        {trackInfo ? (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm px-3 py-1.5 rounded-lg" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-glow)', color: 'var(--accent)' }}>
              {trackInfo.icon} {trackInfo.label} Track
            </span>
            <a href="/practice" className="text-xs transition-colors" style={{ color: 'var(--text-muted)', textDecoration: 'none' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
              ← Switch to general
            </a>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap mb-6">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => handleCategoryChange(cat.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: selectedCategory === cat.id ? 'var(--accent)' : 'var(--bg-card)',
                  color: selectedCategory === cat.id ? '#fff' : 'var(--text-muted)',
                  border: `1px solid ${selectedCategory === cat.id ? 'var(--accent)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        )}

        {totalQuestions > 0 && (
          <div className="mb-5">
            <ProgressBar current={currentIndex} total={totalQuestions} />
          </div>
        )}

        {currentQuestion ? (
          <>
            <QuestionCard question={currentQuestion} showTips={showTips} />

            {!feedback && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Your Answer</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowTips(t => !t)}
                      className="text-xs transition-colors" style={{ color: 'var(--accent)', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}>
                      {showTips ? 'Hide tips' : 'Show tips'}
                    </button>
                    <span className="text-xs font-mono" style={{ color: wordCount > 50 ? '#10B981' : 'var(--text-subtle)' }}>
                      {wordCount} words
                    </span>
                  </div>
                </div>

                <textarea
                  className="textarea-answer w-full p-3 rounded-lg border focus:outline-none transition-colors focus:ring-2"
                  style={{
                    background: 'var(--bg-card)',
                    color: 'var(--text)',
                    borderColor: 'var(--border)',
                    focusRing: 'var(--accent)',
                  }}
                  placeholder="Type your answer, or click 'Speak Answer' to use your microphone…"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={6}
                />

                <div className="flex items-start justify-between gap-3">
                  <SpeechButton
                    isListening={speech.isListening}
                    isSupported={speech.isSupported}
                    interimText={speech.interimText}
                    error={speech.error}
                    onToggle={speech.toggle}
                  />
                  {speech.isListening && (
                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#EF4444' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                      Recording…
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 rounded-xl text-sm border" style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#EF4444'
                  }}>
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button onClick={skipQuestion} className="text-sm transition-colors" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>Skip →</button>
                  <button onClick={submitAnswer} disabled={isLoading || answer.trim().length < 20}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors" style={{
                      background: isLoading || answer.trim().length < 20 ? 'var(--accent)' : 'var(--accent)',
                      color: '#fff',
                      opacity: isLoading || answer.trim().length < 20 ? 0.5 : 1,
                      cursor: isLoading || answer.trim().length < 20 ? 'not-allowed' : 'pointer',
                    }}>
                    {isLoading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing…</>
                    ) : (
                      <>Get AI Feedback <span className="text-white/60 text-xs">⌘↵</span></>
                    )}
                  </button>
                </div>
                {answer.trim().length > 0 && answer.trim().length < 20 && (
                  <p className="text-xs text-right" style={{ color: 'var(--text-muted)' }}>Answer needs to be a bit longer</p>
                )}
              </div>
            )}

            {feedback && (
              <div className="mt-4 space-y-4">
                <FeedbackPanel feedback={feedback} />
                <div className="flex justify-end">
                  <button onClick={nextQuestion} className="btn-primary">Next Question →</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <p className="mb-4" style={{ color: 'var(--text-muted)' }}>No questions loaded.</p>
            <button onClick={() => loadQuestions()} className="px-4 py-2 rounded-lg font-medium text-white transition-colors" style={{ background: 'var(--accent)', cursor: 'pointer' }}>Load Questions</button>
          </div>
        )}
      </div>
    </main>
  );
}
