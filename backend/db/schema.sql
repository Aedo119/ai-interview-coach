-- Run this once to set up the database

CREATE DATABASE interview_coach;

\c interview_coach;

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id   TEXT,
  question      TEXT NOT NULL,
  category      TEXT,
  difficulty    TEXT,
  answer        TEXT NOT NULL,
  overall_score INTEGER,
  scores        JSONB,
  feedback      JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
