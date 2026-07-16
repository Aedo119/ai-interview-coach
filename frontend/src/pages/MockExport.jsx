import { useEffect, useState } from 'react';

// This page is opened in a new tab and auto-prints as PDF
export default function MockExport() {
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('mock_export');
      if (raw) setData(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 600);
  }, [data]);

  if (!data) return <p style={{ fontFamily:'sans-serif', padding:'2rem', color:'#666' }}>No session data found. Run a mock interview first.</p>;

  const { results, config, date } = data;
  const avgScore = Math.round(results.reduce((a, r) => a + (r.feedback?.overallScore || 0), 0) / results.length);
  const dateStr  = new Date(date).toLocaleDateString('en', { year:'numeric', month:'long', day:'numeric' });

  const s = `
    @media print { @page { margin: 2cm; } .no-print { display: none; } }
    body { font-family: 'Inter', system-ui, sans-serif; color: #0f172a; background: #fff; margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
    .page { max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 1.75rem; font-weight: 700; margin: 0 0 4px; }
    h2 { font-size: 1.1rem; font-weight: 600; margin: 0 0 0.75rem; color: #0f172a; }
    h3 { font-size: 0.9rem; font-weight: 600; margin: 0 0 0.5rem; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
    p  { font-size: 0.875rem; color: #475569; line-height: 1.65; margin: 0 0 0.5rem; }
    .meta { font-size: 0.8rem; color: #94a3b8; margin-bottom: 2rem; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0; }
    .score-ring { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 700; border: 3px solid; }
    .header-row { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 1.5rem; }
    .dims { display: grid; grid-template-columns: repeat(5,1fr); gap: 8px; margin-bottom: 1.5rem; }
    .dim { text-align: center; padding: 10px 6px; border-radius: 8px; background: #f8fafc; border: 1px solid #e2e8f0; }
    .dim-val { font-size: 1.25rem; font-weight: 700; }
    .dim-lbl { font-size: 10px; color: #94a3b8; text-transform: capitalize; margin-top: 2px; }
    .q-block { margin-bottom: 1.75rem; padding: 1.25rem; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; break-inside: avoid; }
    .q-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 1rem; }
    .q-num { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; border: 2px solid; flex-shrink: 0; }
    .tag { display: inline-flex; font-size: 10px; padding: 2px 8px; border-radius: 99px; background: #eff6ff; color: #1d4ed8; margin-right: 5px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.75rem; }
    ul { margin: 0; padding: 0; list-style: none; }
    li { font-size: 12px; color: #64748b; display: flex; gap: 6px; margin-bottom: 4px; }
    .pill { display: inline-block; font-size: 11px; padding: 2px 9px; border-radius: 99px; background: #eff6ff; color: #1d4ed8; margin-bottom: 8px; }
    .btn-print { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: 8px; background: #2563eb; color: #fff; border: none; font-size: 13px; cursor: pointer; margin-bottom: 1.5rem; }
  `;

  return (
    <>
      <style>{s}</style>
      <div className="page">
        <button className="btn-print no-print" onClick={() => window.print()}>Save as PDF</button>

        {/* Cover */}
        <div className="header-row">
          <div className="score-ring" style={{ color: avgScore>=75?'#10b981':avgScore>=50?'#f59e0b':'#ef4444', borderColor: avgScore>=75?'#10b981':avgScore>=50?'#f59e0b':'#ef4444' }}>
            {avgScore}
          </div>
          <div>
            <h1>Mock interview report</h1>
            <p className="meta">{dateStr} · {results.length} questions · {config.minutes} min session</p>
          </div>
        </div>

        {/* Dimension averages */}
        <h3>Average dimension scores</h3>
        <div className="dims">
          {['clarity','relevance','depth','structure','impact'].map(dim => {
            const avg = Math.round(results.reduce((a,r) => a+(r.feedback?.scores?.[dim]||0),0)/results.length);
            const c   = avg>=8?'#10b981':avg>=6?'#f59e0b':'#ef4444';
            return (
              <div key={dim} className="dim">
                <div className="dim-val" style={{ color:c }}>{avg}</div>
                <div className="dim-lbl">{dim}</div>
              </div>
            );
          })}
        </div>

        <hr className="divider" />

        {/* Questions */}
        <h3 style={{ marginBottom:'1rem' }}>Question-by-question breakdown</h3>
        {results.map((r, i) => {
          const score = r.feedback?.overallScore;
          const sc    = score>=75?'#10b981':score>=50?'#f59e0b':'#ef4444';
          return (
            <div key={i} className="q-block">
              <div className="q-header">
                <div className="q-num" style={{ color:sc, borderColor:sc }}>{score||'—'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ marginBottom:6 }}>
                    <span className="tag">{r.question.category?.replace('-',' ')}</span>
                    <span className="tag" style={{ background:'#f0fdf4', color:'#15803d' }}>{r.question.difficulty}</span>
                  </div>
                  <h2>{r.question.question}</h2>
                </div>
              </div>

              <h3>Your answer</h3>
              <p>{r.answer || 'Skipped'}</p>

              {r.feedback && (
                <>
                  <h3 style={{ marginTop:'0.75rem' }}>Feedback</h3>
                  <p>{r.feedback.summary}</p>
                  {r.feedback.keyTakeaway && (
                    <div style={{ padding:'8px 12px', borderRadius:6, background:'#eff6ff', border:'1px solid #bfdbfe', marginBottom:'0.75rem' }}>
                      <span style={{ fontSize:11, fontWeight:600, color:'#1d4ed8' }}>Key takeaway: </span>
                      <span style={{ fontSize:12, color:'#3b82f6' }}>{r.feedback.keyTakeaway}</span>
                    </div>
                  )}
                  <div className="two-col">
                    <div>
                      <h3 style={{ color:'#059669' }}>Strengths</h3>
                      <ul>{r.feedback.strengths?.map((s,j) => <li key={j}><span style={{ color:'#10b981' }}>✓</span>{s}</li>)}</ul>
                    </div>
                    <div>
                      <h3 style={{ color:'#d97706' }}>To improve</h3>
                      <ul>{r.feedback.improvements?.map((s,j) => <li key={j}><span style={{ color:'#f59e0b' }}>→</span>{s}</li>)}</ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        <div style={{ marginTop:'2rem', paddingTop:'1rem', borderTop:'1px solid #e2e8f0', textAlign:'center' }}>
          <p style={{ fontSize:11, color:'#94a3b8' }}>Generated by InterviewCoach · interviewcoach.dev</p>
        </div>
      </div>
    </>
  );
}
