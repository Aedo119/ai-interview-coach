import { useEffect, useState } from 'react';
import { useInterview } from '../hooks/useInterview';
import QuestionCard from '../components/QuestionCard';
import FeedbackPanel from '../components/FeedbackPanel';
import ProgressBar from '../components/ProgressBar';

const CATEGORIES = [
  { id: 'all',           label: 'All',           icon: '📋' },
  { id: 'behavioral',   label: 'Behavioral',     icon: '🧠' },
  { id: 'technical',    label: 'Technical',      icon: '💻' },
  { id: 'system-design', label: 'System Design', icon: '🏗️' },
  { id: 'situational',  label: 'Situational',    icon: '⚡' },
  { id: 'culture-fit',  label: 'Culture Fit',    icon: '🤝' },
];

export default function Practice() {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    answer,
    feedback,
    isLoading,
    isLoadingQ,
    error,
    selectedCategory,
    setAnswer,
    setSelectedCategory,
    loadQuestions,
    submitAnswer,
    nextQuestion,
    skipQuestion,
  } = useInterview();

  const [showTips, setShowTips] = useState(false);
  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  // Load questions on mount
  useEffect(() => {
    loadQuestions({ category: 'all', limit: 10 });
  }, []);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    loadQuestions({ category: catId, limit: 10 });
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (!isLoading && answer.trim().length >= 20 && !feedback) {
        submitAnswer();
      }
    }
  };

  if (isLoadingQ) {
    return (
      <main className="min-h-screen pt-14 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 text-sm">Loading questions…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>

        {/* Progress */}
        {totalQuestions > 0 && (
          <div className="mb-5">
            <ProgressBar current={currentIndex} total={totalQuestions} />
          </div>
        )}

        {/* Question card */}
        {currentQuestion ? (
          <>
            <QuestionCard question={currentQuestion} showTips={showTips} />

            {/* Answer area */}
            {!feedback && (
              <div className="mt-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-400">
                    Your Answer
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowTips(t => !t)}
                      className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                    >
                      {showTips ? 'Hide tips' : 'Show tips'}
                    </button>
                    <span className={`text-xs font-mono ${wordCount > 50 ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {wordCount} words
                    </span>
                  </div>
                </div>

                <textarea
                  className="textarea-answer"
                  placeholder="Type your answer here... (aim for 100–250 words for best results)"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                  rows={6}
                />

                {/* Error */}
                {error && (
                  <div className="p-3 bg-red-900/20 border border-red-800/40 rounded-xl text-sm text-red-400">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button onClick={skipQuestion} className="btn-ghost text-sm">
                    Skip →
                  </button>

                  <button
                    onClick={submitAnswer}
                    disabled={isLoading || answer.trim().length < 20}
                    className="btn-primary flex items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Analyzing…
                      </>
                    ) : (
                      <>Get AI Feedback <span className="text-white/60 text-xs">⌘↵</span></>
                    )}
                  </button>
                </div>

                {answer.trim().length > 0 && answer.trim().length < 20 && (
                  <p className="text-xs text-slate-600 text-right">
                    Answer needs to be a bit longer to evaluate
                  </p>
                )}
              </div>
            )}

            {/* Feedback panel */}
            {feedback && (
              <div className="mt-4 space-y-4">
                <FeedbackPanel feedback={feedback} />

                <div className="flex justify-end">
                  <button
                    onClick={nextQuestion}
                    className="btn-primary"
                  >
                    Next Question →
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center">
            <p className="text-slate-400 mb-4">No questions loaded.</p>
            <button onClick={() => loadQuestions()} className="btn-primary">
              Load Questions
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
