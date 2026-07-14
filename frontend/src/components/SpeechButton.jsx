export default function SpeechButton({ isListening, isSupported, interimText, error, onToggle }) {
  if (!isSupported) return null;
  return (
    <div className="space-y-2">
      <button type="button" onClick={onToggle} className="btn btn-secondary text-sm flex items-center gap-2"
        style={ isListening ? { color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)' } : {} }>
        {isListening ? (
          <>
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#ef4444' }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: '#ef4444' }} />
            </span>
            Stop recording
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
            Speak answer
          </>
        )}
      </button>
      {isListening && interimText && (
        <p className="text-xs italic pl-1" style={{ color: 'var(--text-subtle)' }}>"{interimText}…"</p>
      )}
      {error && <p className="text-xs pl-1" style={{ color: '#ef4444' }}>{error}</p>}
    </div>
  );
}
