# AI Interview Coach

An AI-powered interview coaching app with real-time feedback, user auth, and session history.

## Tech Stack
- **Frontend:** React 18 + Tailwind CSS + Vite
- **Backend:** Node.js + Express
- **AI:** Gemini API 

---

## 🚀 Quick Start

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

---

## 📁 Project Structure

```
interview-coach/
├── backend/
│   ├── db/
│   │   └── schema.sql          # Run once to set up PostgreSQL
│   ├── routes/
│   │   ├── auth.js             # Register, login, /me
│   │   ├── feedback.js         # Gemini AI feedback endpoint
│   │   ├── history.js          # Save & fetch session history
│   │   └── questions.js        # Question bank API
│   ├── middleware/
│   │   ├── auth.js             # JWT verification
│   │   └── errorHandler.js
│   ├── data/
│   │   └── questions.js        # 50+ questions across 5 categories
│   ├── db.js                   # PostgreSQL connection pool
│   ├── server.js
│   ├── package.json
│   └── .env.example
└── frontend/
    └── src/
        ├── components/
        │   ├── FeedbackPanel.jsx
        │   ├── Navbar.jsx
        │   ├── ProgressBar.jsx
        │   └── QuestionCard.jsx
        ├── context/
        │   └── AuthContext.jsx     # Global auth state
        ├── hooks/
        │   └── useInterview.js
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
