const express     = require('express');
const router      = express.Router();
const roleTracks  = require('../data/roleTracks');

// GET /api/tracks — list all tracks (metadata only)
router.get('/', (req, res) => {
  const tracks = Object.values(roleTracks).map(({ id, label, icon, color, description }) => ({
    id, label, icon, color, description,
    questionCount: roleTracks[id].questions.length,
  }));
  res.json({ tracks });
});

// GET /api/tracks/:id/questions — questions for a specific track
router.get('/:id/questions', (req, res) => {
  const track = roleTracks[req.params.id];
  if (!track) return res.status(404).json({ error: 'Track not found.' });

  const { limit } = req.query;
  let questions = [...track.questions].sort(() => Math.random() - 0.5);
  if (limit) questions = questions.slice(0, parseInt(limit));

  res.json({ track: { id: track.id, label: track.label, icon: track.icon }, questions });
});

module.exports = router;
