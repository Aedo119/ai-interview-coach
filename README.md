# AI Interview Coach

An AI-powered interview coaching app with real-time feedback, speech-to-text input, visual scoring, user auth, and session history.

## Tech Stack

| Layer    | Tech                              |
|----------|-----------------------------------|
| Frontend | React 18 + Tailwind CSS + Vite    |
| Backend  | Node.js + Express                 |
| AI       | Google Gemini API (free)          |
| Database | PostgreSQL                        |
| Auth     | JWT + bcryptjs                    |
| Speech   | Web Speech API (Chrome built-in)  |

---

## Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Set up the database

```bash
psql -U postgres -f backend/db/schema.sql
```

### 3. Set up environment variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

```env
GEMINI_API_KEY=your_key_from_aistudio.google.com
JWT_SECRET=any_long_random_string
DB_HOST=localhost
DB_PORT=5432
DB_NAME=interview_coach
DB_USER=postgres
DB_PASSWORD=your_postgres_password
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 4. Run the app

```bash
# Terminal 1 — backend (port 5000)
cd backend
npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend
npm run dev
```

> **Note:** Speech-to-text requires Chrome or Edge. Safari does not support the Web Speech API.

---

## 📁 Project Structure

```
interview-coach/
├── backend/
│   ├── db/
│   │   └── schema.sql              # Run once to set up PostgreSQL
│   ├── routes/
│   │   ├── auth.js                 # Register, login, /me
│   │   ├── feedback.js             # Gemini AI feedback endpoint
│   │   ├── history.js              # Save & fetch session history
│   │   └── questions.js            # Question bank API
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification
│   │   └── errorHandler.js
│   ├── data/
│   │   └── questions.js            # 50+ questions across 5 categories
│   ├── db.js                       # PostgreSQL connection pool
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── FeedbackPanel.jsx   # Tabbed feedback: Overview / STAR / Improved Answer
        │   ├── Navbar.jsx
        │   ├── ProgressBar.jsx
        │   ├── QuestionCard.jsx
        │   ├── ScoreChart.jsx      # Radar chart + animated bar chart
        │   └── SpeechButton.jsx    # Mic button with pulse animation
        ├── context/
        │   └── AuthContext.jsx     # Global auth state
        ├── hooks/
        │   ├── useInterview.js
        │   └── useSpeech.js        # Web Speech API hook
        ├── pages/
        │   ├── Home.jsx
        │   ├── Login.jsx
        │   ├── Practice.jsx
        │   ├── Register.jsx
        │   └── Results.jsx
        ├── utils/
        │   └── api.js
        ├── App.jsx
        └── main.jsx
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/questions` | No | Fetch question bank |
| POST | `/api/feedback` | No | Get AI feedback on answer |
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/history` | Yes | Fetch session history |
| POST | `/api/history` | Yes | Save a session |
| DELETE | `/api/history/:id` | Yes | Delete a session |

---

## Features

- **AI Feedback** — Google Gemini evaluates every answer across 5 dimensions
- **Visual Scoring** — Radar chart + animated bars showing clarity, relevance, depth, structure, impact
- **STAR Analysis** — Breakdown of how well your answer follows Situation / Task / Action / Result
- **Improved Answer** — Model answer rewritten by AI to demonstrate best practices
- **Speech-to-Text** — Speak your answer directly using your microphone (Chrome/Edge)
- **50+ Questions** — Behavioral, technical, system design, situational, and culture fit
- **Auth** — JWT-based register/login with bcrypt password hashing
- **Session History** — All sessions saved to PostgreSQL, viewable and deletable
- **Security** — Rate limiting, helmet headers, XSS protection on all API routes