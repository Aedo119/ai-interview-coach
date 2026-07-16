const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const pool     = require('../db');
const auth     = require('../middleware/auth');

router.use(auth);

// GET /api/profile — full profile + stats
router.get('/', async (req, res) => {
  try {
    const userRes = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!userRes.rows[0]) return res.status(404).json({ error: 'User not found.' });

    const statsRes = await pool.query(
      `SELECT COUNT(*) AS total_sessions, ROUND(AVG(overall_score)) AS avg_score
       FROM sessions WHERE user_id = $1 AND overall_score IS NOT NULL`,
      [req.user.id]
    );

    res.json({ user: userRes.rows[0], stats: statsRes.rows[0] });
  } catch (err) {
    console.error('Profile fetch error:', err.message);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// PUT /api/profile — update name and/or email
router.put('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name?.trim() || !email?.trim())
    return res.status(400).json({ error: 'Name and email are required.' });

  try {
    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email',
      [name.trim(), email.toLowerCase().trim(), req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'That email is already in use.' });
    console.error('Profile update error:', err.message);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// PUT /api/profile/password — change password
router.put('/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ error: 'Current and new password are required.' });
  if (newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });

  try {
    const userRes = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, userRes.rows[0].password);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, req.user.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Password change error:', err.message);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// DELETE /api/profile — delete account
router.delete('/', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete account.' });
  }
});

module.exports = router;
