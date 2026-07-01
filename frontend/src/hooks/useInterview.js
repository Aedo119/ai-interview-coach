import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export function useInterview() {
  const [questions, setQuestions]         = useState([]);
  const [currentIndex, setCurrentIndex]   = useState(0);
  const [answer, setAnswer]               = useState('');
  const [feedback, setFeedback]           = useState(null);
  const [isLoading, setIsLoading]         = useState(false);
  const [isLoadingQ, setIsLoadingQ]       = useState(false);
  const [error, setError]                 = useState(null);
  const [sessionHistory, setSessionHistory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentQuestion = questions[currentIndex] || null;

  // Load a set of questions
  const loadQuestions = useCallback(async (opts = {}) => {
    setIsLoadingQ(true);
    setError(null);
    try {
      const data = await api.getQuestions({ limit: 10, ...opts });
      setQuestions(data.questions);
      setCurrentIndex(0);
      setAnswer('');
      setFeedback(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingQ(false);
    }
  }, []);

  // Submit answer to Claude for feedback
  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !answer.trim()) return;
    setIsLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const data = await api.submitAnswer({
        question:   currentQuestion.question,
        answer:     answer.trim(),
        category:   currentQuestion.category,
        difficulty: currentQuestion.difficulty,
        questionId: currentQuestion.id,
      });
      setFeedback(data.feedback);

      // Save to session history (state + sessionStorage for Results page)
      const entry = {
        question:  currentQuestion,
        answer:    answer.trim(),
        feedback:  data.feedback,
        timestamp: new Date().toISOString(),
      };
      setSessionHistory(prev => {
        const next = [...prev, entry];
        try {
          sessionStorage.setItem('interview_history', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, answer]);

  // Move to next question
  const nextQuestion = useCallback(() => {
    setAnswer('');
    setFeedback(null);
    setError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      // Reload a fresh set
      loadQuestions({ category: selectedCategory });
    }
  }, [currentIndex, questions.length, selectedCategory, loadQuestions]);

  // Skip question
  const skipQuestion = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  return {
    // State
    questions,
    currentQuestion,
    currentIndex,
    answer,
    feedback,
    isLoading,
    isLoadingQ,
    error,
    sessionHistory,
    selectedCategory,
    totalQuestions: questions.length,

    // Actions
    setAnswer,
    setSelectedCategory,
    loadQuestions,
    submitAnswer,
    nextQuestion,
    skipQuestion,
  };
}
