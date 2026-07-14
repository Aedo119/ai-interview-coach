const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const auth    = require('../middleware/auth');

router.use(auth);

// GET /api/analytics — full analytics for the logged-in user
router.get('/', async (req, res) => {
  try {
    // Score over time (last 30 sessions)
    const scoreHistory = await pool.query(
      `SELECT overall_score, category, created_at
       FROM sessions
       WHERE user_id = $1 AND overall_score IS NOT NULL
       ORDER BY created_at ASC
       LIMIT 30`,
      [req.user.id]
    );

    // Average score per category
    const categoryAvg = await pool.query(
      `SELECT category,
              ROUND(AVG(overall_score)) AS avg_score,
              COUNT(*) AS attempts
       FROM sessions
       WHERE user_id = $1 AND overall_score IS NOT NULL AND category IS NOT NULL
       GROUP BY category
       ORDER BY avg_score DESC`,
      [req.user.id]
    );

    // Average per dimension score (from JSONB scores column)
    const dimensionAvg = await pool.query(
      `SELECT
         ROUND(AVG((scores->>'clarity')::numeric))   AS clarity,
         ROUND(AVG((scores->>'relevance')::numeric)) AS relevance,
         ROUND(AVG((scores->>'depth')::numeric))     AS depth,
         ROUND(AVG((scores->>'structure')::numeric)) AS structure,
         ROUND(AVG((scores->>'impact')::numeric))    AS impact
       FROM sessions
       WHERE user_id = $1 AND scores IS NOT NULL`,
      [req.user.id]
    );

    // Summary stats
    const summary = await pool.query(
      `SELECT
         COUNT(*)                          AS total_sessions,
         ROUND(AVG(overall_score))         AS avg_score,
         MAX(overall_score)                AS best_score,
         MIN(overall_score)                AS worst_score
       FROM sessions
       WHERE user_id = $1 AND overall_score IS NOT NULL`,
      [req.user.id]
    );

    res.json({
      scoreHistory:  scoreHistory.rows,
      categoryAvg:   categoryAvg.rows,
      dimensionAvg:  dimensionAvg.rows[0],
      summary:       summary.rows[0],
    });

  } catch (err) {
    console.error('Analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics.' });
  }
});

module.exports = router;
