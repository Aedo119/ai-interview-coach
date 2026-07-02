export default function SpeechButton({ isListening, isSupported, interimText, error, onToggle }) {
  if (!isSupported) return null;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
          isListening
            ? 'bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30'
            : 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
        }`}
      >
        {isListening ? (
          <>
            {/* Animated mic pulse */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Stop Recording
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4zm0 2a2 2 0 0 0-2 2v6a2 2 0 0 0 4 0V5a2 2 0 0 0-2-2zm6.5 7a.5.5 0 0 1 .5.5A7 7 0 0 1 12.5 17v2.5H15a.5.5 0 0 1 0 1H9a.5.5 0 0 1 0-1h2.5V17A7 7 0 0 1 5 10.5a.5.5 0 0 1 1 0 6 6 0 0 0 12 0 .5.5 0 0 1 .5-.5z"/>
            </svg>
            Speak Answer
          </>
        )}
      </button>

      {/* Interim transcript preview */}
      {isListening && interimText && (
        <p className="text-xs text-slate-500 italic px-1">
          "{interimText}…"
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 px-1">{error}</p>
      )}
    </div>
  );
}
