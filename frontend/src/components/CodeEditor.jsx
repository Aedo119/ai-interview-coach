import { useEffect, useRef } from 'react';

// CodeMirror 6 loaded via CDN in index.html
// We use a simple wrapper that initialises it from the global

export default function CodeEditor({ value, onChange, language = 'javascript', height = 280 }) {
  const ref      = useRef(null);
  const viewRef  = useRef(null);

  useEffect(() => {
    // Dynamically import CodeMirror from CDN globals injected via index.html script tags
    const init = async () => {
      const { EditorView, basicSetup } = window.CM_BASE  || {};
      const { javascript }             = window.CM_LANG_JS || {};
      const { python }                 = window.CM_LANG_PY || {};
      const { oneDark }                = window.CM_THEME  || {};

      if (!EditorView) {
        // Fallback if CM not loaded yet
        console.warn('CodeMirror not loaded');
        return;
      }

      if (viewRef.current) viewRef.current.destroy();

      const extensions = [basicSetup];
      if (language === 'javascript' && javascript) extensions.push(javascript());
      if (language === 'python'     && python)     extensions.push(python());
      if (oneDark) extensions.push(oneDark);

      extensions.push(
        EditorView.updateListener.of(update => {
          if (update.docChanged) onChange(update.state.doc.toString());
        })
      );

      viewRef.current = new EditorView({
        doc: value,
        extensions,
        parent: ref.current,
      });
    };

    init();
    return () => { if (viewRef.current) viewRef.current.destroy(); };
  }, [language]);

  // Sync external value changes without destroying the view
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== value) {
      view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return (
    <div ref={ref} style={{
      borderRadius: 10,
      overflow: 'hidden',
      border: '1px solid var(--border)',
      fontSize: 13,
      minHeight: height,
    }} />
  );
}
