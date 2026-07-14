const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

// All history routes require auth
router.use(auth);

// POST /api/history — save a completed session
router.post('/', async (req, res) => {
  const { questionId, question, category, difficulty, answer, feedback } = req.body;

  if (!question || !answer || !feedback)
    return res.status(400).json({ error: 'question, answer and feedback are required.' });

  try {
    const result = await pool.query(
  `INSERT INTO sessions
    (user_id, question_id, question, category, difficulty, answer, overall_score, scores, feedback)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
   RETURNING id, created_at`,
  [
    req.user.id,
    questionId || null,
    question,
    category  || null,
    difficulty || null,
    answer,
    feedback.overallScore || null,
    feedback.scores || {},        // ← no JSON.stringify, pg handles JSONB
    feedback,                     // ← no JSON.stringify
  ]
);
    res.status(201).json({ session: result.rows[0] });
  } catch (err) {
    console.error('Save session error:', err.message);
    res.status(500).json({ error: 'Failed to save session.' });
  }
});

// GET /api/history — get all sessions for logged-in user
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, question_id, question, category, difficulty,
              answer, overall_score, scores, feedback, created_at
       FROM sessions
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 100`,
      [req.user.id]
    );
    res.json({ sessions: result.rows });
  } catch (err) {
    console.error('Fetch history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// DELETE /api/history/:id — delete a single session
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM sessions WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session.' });
  }
});

module.exports = router;
