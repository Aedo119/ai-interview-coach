require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');

const feedbackRoutes  = require('./routes/feedback');
const questionsRoutes = require('./routes/questions');
const authRoutes      = require('./routes/auth');
const historyRoutes   = require('./routes/history');
const tracksRoutes    = require('./routes/tracks');
const analyticsRoutes = require('./routes/analytics');
const codingRoutes    = require('./routes/coding');
const profileRoutes   = require('./routes/profile');
const errorHandler    = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10kb' }));

const aiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30,
  message: { error: 'Too many requests, please try again later.' } });

app.use('/api/questions', questionsRoutes);
app.use('/api/feedback',  aiLimiter, feedbackRoutes);
app.use('/api/auth',      authRoutes);
app.use('/api/history',   historyRoutes);
app.use('/api/tracks',    tracksRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/coding',    codingRoutes);
app.use('/api/profile',   profileRoutes);

app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Interview Coach API running on port ${PORT}`);
});
