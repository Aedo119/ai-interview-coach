export default function TestCaseResults({ results, complexity, running, pyLoading }) {
  if (pyLoading) return (
    <div style={{ padding:'1rem', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:16, height:16, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
      <span style={{ fontSize:13, color:'var(--text-muted)' }}>Loading Python runtime (first run only, ~5s)…</span>
    </div>
  );

  if (running) return (
    <div style={{ padding:'1rem', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
      <div style={{ width:16, height:16, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite', flexShrink:0 }} />
      <span style={{ fontSize:13, color:'var(--text-muted)' }}>Running test cases…</span>
    </div>
  );

  if (!results) return null;

  const passed = results.filter(r => r.passed).length;
  const total  = results.length;
  const allPass = passed === total;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      {/* Summary bar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', borderRadius:10,
        background: allPass ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${allPass ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <i className={`ti ${allPass ? 'ti-circle-check' : 'ti-circle-x'}`}
            style={{ fontSize:18, color: allPass ? '#10b981' : '#ef4444' }} aria-hidden="true" />
          <span style={{ fontSize:14, fontWeight:600, color: allPass ? '#10b981' : '#ef4444' }}>
            {passed}/{total} test cases passed
          </span>
        </div>
        {allPass && <span style={{ fontSize:12, color:'#10b981' }}>All tests passing</span>}
      </div>

      {/* Complexity */}
      {complexity && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          <div style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 4px' }}>Estimated time</p>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', margin:'0 0 2px', fontFamily:'monospace' }}>{complexity.estimated.time}</p>
            {complexity.optimal && (
              <p style={{ fontSize:11, color:'var(--text-subtle)', margin:0 }}>Optimal: <span style={{ fontFamily:'monospace' }}>{complexity.optimal.time}</span></p>
            )}
          </div>
          <div style={{ padding:'10px 14px', borderRadius:10, background:'var(--bg-subtle)', border:'1px solid var(--border)' }}>
            <p style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-subtle)', margin:'0 0 4px' }}>Estimated space</p>
            <p style={{ fontSize:13, fontWeight:600, color:'var(--text)', margin:'0 0 2px', fontFamily:'monospace' }}>{complexity.estimated.space}</p>
            {complexity.optimal && (
              <p style={{ fontSize:11, color:'var(--text-subtle)', margin:0 }}>Optimal: <span style={{ fontFamily:'monospace' }}>{complexity.optimal.space}</span></p>
            )}
          </div>
        </div>
      )}

      {/* Per test case */}
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        {results.map((r, i) => (
          <div key={i} style={{ padding:'10px 14px', borderRadius:9, display:'flex', alignItems:'flex-start', gap:10,
            background: r.passed ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
            border: `1px solid ${r.passed ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'}` }}>
            <i className={`ti ${r.passed ? 'ti-check' : 'ti-x'}`}
              style={{ fontSize:14, color: r.passed ? '#10b981' : '#ef4444', flexShrink:0, marginTop:1 }} aria-hidden="true" />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, color:'var(--text-subtle)' }}>
                  Input: <code style={{ fontFamily:'monospace', color:'var(--text-muted)', fontSize:11 }}>{JSON.stringify(r.input)}</code>
                </span>
                <span style={{ fontSize:12, color:'var(--text-subtle)' }}>
                  Expected: <code style={{ fontFamily:'monospace', color:'var(--text-muted)', fontSize:11 }}>{JSON.stringify(r.expected)}</code>
                </span>
                {!r.passed && r.output !== null && (
                  <span style={{ fontSize:12, color:'#ef4444' }}>
                    Got: <code style={{ fontFamily:'monospace', fontSize:11 }}>{JSON.stringify(r.output)}</code>
                  </span>
                )}
              </div>
              {r.error && <p style={{ fontSize:11, color:'#ef4444', margin:'4px 0 0', fontFamily:'monospace' }}>{r.error}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}