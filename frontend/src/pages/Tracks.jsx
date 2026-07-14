import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

const COLOR_MAP = {
  blue:   { badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',   btn: 'bg-blue-600 hover:bg-blue-500' },
  violet: { badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400', btn: 'bg-violet-600 hover:bg-violet-500' },
  emerald:{ badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400', btn: 'bg-emerald-600 hover:bg-emerald-500' },
};

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
    <main className="min-h-screen pt-14 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </main>
  );

  return (
    <main className="min-h-screen pt-14 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-3">Choose Your Track</h1>
          <p className="text-slate-400">Role-specific questions tailored to what interviewers actually ask.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {tracks.map(track => {
            const c = COLOR_MAP[track.color] || COLOR_MAP.blue;
            return (
              <div key={track.id} className="card p-6 flex flex-col hover:border-slate-700 transition-colors">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium w-fit mb-4 ${c.badge}`}>
                  {track.icon} {track.label}
                </div>
                <p className="text-slate-400 text-sm flex-1 mb-6 leading-relaxed">{track.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">{track.questionCount} questions</span>
                  <button
                    onClick={() => navigate(`/practice?track=${track.id}`)}
                    className={`text-sm text-white font-medium px-4 py-2 rounded-xl transition-colors ${c.btn}`}
                  >
                    Start →
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button onClick={() => navigate('/practice')} className="btn-ghost text-sm text-slate-500">
            Or practice with the general question bank →
          </button>
        </div>
      </div>
    </main>
  );
}
