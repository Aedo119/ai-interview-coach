const BASE_URL = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
  return data;
}

export const api = {
  // ── Questions ──────────────────────────────────────────────────────
  getQuestions: ({ category, difficulty, limit } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    if (limit) params.set('limit', limit);
    const qs = params.toString();
    return fetch(`${BASE_URL}/questions${qs ? `?${qs}` : ''}`).then(handleResponse);
  },

  // ── Feedback ───────────────────────────────────────────────────────
  submitAnswer: ({ question, answer, category, difficulty, questionId }) =>
    fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, answer, category, difficulty, questionId }),
    }).then(handleResponse),

  // ── Auth ───────────────────────────────────────────────────────────
  register: ({ name, email, password }) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  login: ({ email, password }) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  // ── History ────────────────────────────────────────────────────────
  saveSession: (payload) =>
    fetch(`${BASE_URL}/history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getHistory: () =>
    fetch(`${BASE_URL}/history`, {
      headers: { ...authHeaders() },
    }).then(handleResponse),

  deleteSession: (id) =>
    fetch(`${BASE_URL}/history/${id}`, {
      method: 'DELETE',
      headers: { ...authHeaders() },
    }).then(handleResponse),
};
