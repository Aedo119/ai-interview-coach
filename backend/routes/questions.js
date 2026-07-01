const express = require('express');
const router = express.Router();
const { questions, categories } = require('../data/questions');

// GET /api/questions — all questions with optional category filter
router.get('/', (req, res) => {
  const { category, difficulty, limit } = req.query;

  let filtered = [...questions];

  if (category && category !== 'all') {
    filtered = filtered.filter(q => q.category === category);
  }

  if (difficulty) {
    filtered = filtered.filter(q => q.difficulty === difficulty);
  }

  // Shuffle for variety
  filtered = filtered.sort(() => Math.random() - 0.5);

  if (limit) {
    filtered = filtered.slice(0, parseInt(limit));
  }

  res.json({
    questions: filtered,
    total: filtered.length,
    categories,
  });
});

// GET /api/questions/random — single random question
router.get('/random', (req, res) => {
  const { category } = req.query;
  let pool = category && category !== 'all'
    ? questions.filter(q => q.category === category)
    : questions;

  const question = pool[Math.floor(Math.random() * pool.length)];
  res.json({ question });
});

// GET /api/questions/:id — single question by id
router.get('/:id', (req, res) => {
  const question = questions.find(q => q.id === req.params.id);
  if (!question) return res.status(404).json({ error: 'Question not found' });
  res.json({ question });
});

module.exports = router;
