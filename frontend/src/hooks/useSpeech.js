import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeech({ onTranscript }) {
  const [isListening, setIsListening]   = useState(false);
  const [isSupported, setIsSupported]   = useState(false);
  const [interimText, setInterimText]   = useState('');
  const [error, setError]               = useState('');
  const recognitionRef                  = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setIsSupported(false); return; }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous      = true;
    recognition.interimResults  = true;
    recognition.lang            = 'en-US';

    recognition.onresult = (e) => {
      let interim = '';
      let final   = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setInterimText(interim);
      if (final) onTranscript(final);
    };

    recognition.onerror = (e) => {
      if (e.error === 'not-allowed') setError('Microphone access denied. Please allow mic access and try again.');
      else if (e.error !== 'no-speech') setError(`Speech error: ${e.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;
    return () => recognition.abort();
  }, [onTranscript]);

  const start = useCallback(() => {
    setError('');
    setInterimText('');
    recognitionRef.current?.start();
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterimText('');
  }, []);

  const toggle = useCallback(() => {
    isListening ? stop() : start();
  }, [isListening, start, stop]);

  return { isListening, isSupported, interimText, error, start, stop, toggle };
}
