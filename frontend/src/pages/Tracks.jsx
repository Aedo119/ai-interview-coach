import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Tracks() {
  const [tracks, setTracks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();

  useEffect(() => {
    api.getTracks()
      .then(d => setTracks(d.tracks))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className="min-h-screen pt-14 flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--accent)' }} />
    </main>
  );

  return (
    <main className="min-h-screen pt-14 pb-20" style={{ background: 'var(--bg)' }}>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text)' }}>Choose Your Track</h1>
          <p style={{ color: 'var(--text-muted)' }}>Role-specific questions tailored to what interviewers actually ask.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {tracks.map(track => {
            return (
              <div key={track.id} className="card p-6 flex flex-col transition-colors" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium w-fit mb-4" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent-glow)' }}>
                  {track.icon} {track.label}
                </div>
                <p className="text-sm flex-1 mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{track.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-subtle)' }}>{track.questionCount} questions</span>
                  <button
                    onClick={() => navigate(`/practice?track=${track.id}`)}
                    className="text-sm text-white font-medium px-4 py-2 rounded-lg transition-colors btn btn-primary"
                  >
                    Start →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/practice')} className="btn btn-ghost rounded-lg text-sm" style={{ color: 'var(--text-muted)' }}>
            Or practice with the general question bank →
          </button>
        </div>
      </div>
    </main>
  );
}
