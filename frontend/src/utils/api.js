const BASE_URL = '/api';

function getToken() { return localStorage.getItem('token'); }
function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}
async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

export const api = {
  // Questions
  getQuestions: ({ category, difficulty, limit } = {}) => {
    const p = new URLSearchParams();
    if (category && category !== 'all') p.set('category', category);
    if (difficulty) p.set('difficulty', difficulty);
    if (limit) p.set('limit', limit);
    const qs = p.toString();
    return fetch(`${BASE_URL}/questions${qs ? `?${qs}` : ''}`).then(handleResponse);
  },

  // Feedback
  submitAnswer: (payload) =>
    fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(handleResponse),

  // Auth
  register: (body) => fetch(`${BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse),
  login:    (body) => fetch(`${BASE_URL}/auth/login`,    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(handleResponse),

  // History
  saveSession: (payload) =>
    fetch(`${BASE_URL}/history`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(payload) }).then(handleResponse),
  getHistory:     () => fetch(`${BASE_URL}/history`,     { headers: authHeaders() }).then(handleResponse),
  deleteSession: (id) => fetch(`${BASE_URL}/history/${id}`, { method: 'DELETE', headers: authHeaders() }).then(handleResponse),

  // Tracks
  getTracks: () => fetch(`${BASE_URL}/tracks`).then(handleResponse),
  getTrackQuestions: (id, limit = 10) =>
    fetch(`${BASE_URL}/tracks/${id}/questions?limit=${limit}`).then(handleResponse),

  // Analytics
  getAnalytics: () => fetch(`${BASE_URL}/analytics`, { headers: authHeaders() }).then(handleResponse),
};
