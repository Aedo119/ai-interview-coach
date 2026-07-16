const express        = require('express');
const router         = express.Router();
const codingProblems = require('../data/codingProblems');

// GET /api/coding
router.get('/', (req, res) => {
  const { difficulty } = req.query;
  let problems = codingProblems.map(({ id, category, difficulty, question, description, examples, starterCode, optimalComplexity, tips }) =>
    ({ id, category, difficulty, question, description, examples, starterCode, optimalComplexity, tips })
  );
  if (difficulty) problems = problems.filter(p => p.difficulty === difficulty);
  res.json({ problems });
});

// GET /api/coding/random
router.get('/random', (req, res) => {
  const { difficulty } = req.query;
  let pool = difficulty ? codingProblems.filter(p => p.difficulty === difficulty) : codingProblems;
  const problem = pool[Math.floor(Math.random() * pool.length)];
  const { testCases, runnerJs, runnerPy, ...safe } = problem;
  res.json({ problem: safe });
});

// GET /api/coding/:id/cases
router.get('/:id/cases', (req, res) => {
  const problem = codingProblems.find(p => p.id === req.params.id);
  if (!problem) return res.status(404).json({ error: 'Problem not found' });
  res.json({
    testCases:         problem.testCases,
    runnerJs:          problem.runnerJs,
    runnerPy:          problem.runnerPy,
    optimalComplexity: problem.optimalComplexity,
  });
});

module.exports = router;