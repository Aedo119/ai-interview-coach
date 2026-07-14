import { useState, useCallback } from 'react';
import { api } from '../utils/api';

export function useInterview() {
  const [questions, setQuestions]           = useState([]);
  const [currentIndex, setCurrentIndex]     = useState(0);
  const [answer, setAnswer]                 = useState('');
  const [feedback, setFeedback]             = useState(null);
  const [isLoading, setIsLoading]           = useState(false);
  const [isLoadingQ, setIsLoadingQ]         = useState(false);
  const [error, setError]                   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const currentQuestion = questions[currentIndex] || null;

  const loadQuestions = useCallback(async (opts = {}) => {
    setIsLoadingQ(true);
    setError(null);
    try {
      let qs;
      if (opts.trackId) {
        const data = await api.getTrackQuestions(opts.trackId, opts.limit || 10);
        qs = data.questions;
      } else {
        const data = await api.getQuestions({ limit: 10, ...opts });
        qs = data.questions;
      }
      setQuestions(qs);
      setCurrentIndex(0);
      setAnswer('');
      setFeedback(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoadingQ(false);
    }
  }, []);

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

      if (localStorage.getItem('token')) {
        api.saveSession({
          questionId: currentQuestion.id,
          question:   currentQuestion.question,
          category:   currentQuestion.category,
          difficulty: currentQuestion.difficulty,
          answer:     answer.trim(),
          feedback:   data.feedback,
        }).catch(() => {});
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, answer]);

  const nextQuestion = useCallback(() => {
    setAnswer('');
    setFeedback(null);
    setError(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      loadQuestions({ category: selectedCategory });
    }
  }, [currentIndex, questions.length, selectedCategory, loadQuestions]);

  return {
    questions, currentQuestion, currentIndex,
    answer, feedback, isLoading, isLoadingQ, error,
    selectedCategory, totalQuestions: questions.length,
    setAnswer, setSelectedCategory,
    loadQuestions, submitAnswer,
    nextQuestion, skipQuestion: nextQuestion,
  };
}
