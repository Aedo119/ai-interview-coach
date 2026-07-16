import { useState, useCallback } from 'react';

// Runs JS code in a sandboxed Function scope
function runJavaScript(code, runnerExpr, testCases) {
  const results = [];
  for (const tc of testCases) {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`${code}\nreturn ${runnerExpr};`)();
      const output = fn(...tc.input);
      const passed = JSON.stringify(output) === JSON.stringify(tc.expected);
      results.push({ input: tc.input, expected: tc.expected, output, passed, error: null });
    } catch (err) {
      results.push({ input: tc.input, expected: tc.expected, output: null, passed: false, error: err.message });
    }
  }
  return results;
}

// Runs Python via Pyodide (loaded lazily)
async function runPython(code, runnerFn, testCases) {
  if (!window.loadPyodide) throw new Error('Pyodide not loaded. Make sure index.html includes the Pyodide script.');
  if (!window._pyodide) {
    window._pyodide = await window.loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/' });
  }
  const py = window._pyodide;
  const results = [];
  for (const tc of testCases) {
    try {
      const argsJson = JSON.stringify(tc.input);
      const script = `
import json
${code}
_args = json.loads('${argsJson.replace(/'/g, "\\'")}')
_result = ${runnerFn}(*_args)
json.dumps(_result)
      `;
      const raw    = await py.runPythonAsync(script);
      const output = JSON.parse(raw);
      const passed = JSON.stringify(output) === JSON.stringify(tc.expected);
      results.push({ input: tc.input, expected: tc.expected, output, passed, error: null });
    } catch (err) {
      results.push({ input: tc.input, expected: tc.expected, output: null, passed: false, error: String(err) });
    }
  }
  return results;
}

// Rough complexity estimator based on loop nesting depth
function estimateComplexity(code) {
  const loopKeywords = (code.match(/\b(for|while)\b/g) || []).length;
  const nestedLoops  = (code.match(/\b(for|while)\b[\s\S]*?\b(for|while)\b/g) || []).length;
  if (nestedLoops > 0)     return { time: 'O(n²) or worse', space: 'O(n)' };
  if (loopKeywords === 1)  return { time: 'O(n)',            space: 'O(1) or O(n)' };
  if (loopKeywords === 0)  return { time: 'O(1) or O(log n)', space: 'O(1)' };
  return { time: 'O(n log n) or O(n²)', space: 'O(n)' };
}

export function useCodeRunner() {
  const [results,    setResults]    = useState(null);
  const [running,    setRunning]    = useState(false);
  const [complexity, setComplexity] = useState(null);
  const [pyLoading,  setPyLoading]  = useState(false);

  const run = useCallback(async ({ code, language, testCases, runnerJs, runnerPy, optimalComplexity }) => {
    setRunning(true);
    setResults(null);
    try {
      let res;
      if (language === 'python') {
        if (!window._pyodide && !window._pyodideLoading) {
          setPyLoading(true);
          window._pyodideLoading = true;
        }
        res = await runPython(code, runnerPy, testCases);
        setPyLoading(false);
      } else {
        res = runJavaScript(code, runnerJs, testCases);
      }
      const est = estimateComplexity(code);
      setResults(res);
      setComplexity({ estimated: est, optimal: optimalComplexity });
    } catch (err) {
      setResults([{ input: [], expected: null, output: null, passed: false, error: err.message }]);
    } finally {
      setRunning(false);
      setPyLoading(false);
    }
  }, []);

  const reset = useCallback(() => { setResults(null); setComplexity(null); }, []);

  return { run, reset, results, running, complexity, pyLoading };
}