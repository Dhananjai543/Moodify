import { useState, useEffect, useRef, useCallback } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const MAX_DURATION = 30;
const BAR_COUNT = 24;

export default function MicButton({ onRecordingComplete }) {
  const [status, setStatus] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [bars, setBars] = useState(() => new Array(BAR_COUNT).fill(4));

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);
  const elapsedRef = useRef(0);
  const finalTranscriptRef = useRef('');

  const {
    isSupported,
    finalTranscript,
    interimTranscript,
    start: startRecognition,
    stop: stopRecognition,
    reset: resetRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    finalTranscriptRef.current = finalTranscript;
  }, [finalTranscript]);

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const visualize = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const draw = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.floor(data.length / BAR_COUNT);
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        const val = data[i * step] / 255;
        return Math.max(4, val * 40);
      });
      setBars(next);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      resetRecognition();
      elapsedRef.current = 0;
      setElapsed(0);
      setStatus('recording');
      visualize();
      startRecognition();

      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
        if (elapsedRef.current >= MAX_DURATION) stopRecording();
      }, 1000);
    } catch {
      setStatus('idle');
    }
  };

  const stopRecording = useCallback(() => {
    cleanup();
    stopRecognition();
    setBars(new Array(BAR_COUNT).fill(4));
    setStatus('processing');

    setTimeout(() => {
      setStatus('idle');
      setElapsed(0);
      onRecordingComplete?.(finalTranscriptRef.current);
    }, 1500);
  }, [cleanup, stopRecognition, onRecordingComplete]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  if (!isSupported) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-red-400">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium">Speech recognition not supported</p>
        <p className="text-gray-400 text-sm">Your browser doesn't support speech recognition. Try Chrome or Edge.</p>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
        <p className="text-gray-400 text-sm">Processing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {status === 'recording' && (
        <div className="flex items-end gap-[3px] h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full bg-green-400 transition-[height] duration-100"
              style={{ height: `${h}px` }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {status === 'recording' && (
          <span className="absolute inset-0 rounded-full bg-green-500/30 animate-[mic-pulse_1.5s_ease-in-out_infinite]" />
        )}
        <button
          onClick={status === 'idle' ? startRecording : undefined}
          className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            status === 'recording'
              ? 'bg-green-500 shadow-lg shadow-green-500/30'
              : 'bg-gray-800 hover:bg-gray-700'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </button>
      </div>

      {status === 'recording' ? (
        <>
          <p className="text-sm text-gray-400 tabular-nums">
            {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
          </p>

          {(finalTranscript || interimTranscript) && (
            <div className="max-w-md w-full px-4 text-center">
              <p className="text-sm leading-relaxed">
                <span className="text-white">{finalTranscript}</span>
                <span className="text-gray-500 italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          <button
            onClick={stopRecording}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/50 hover:border-red-300 py-2 px-5 rounded-full transition-colors cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop
          </button>
        </>
      ) : (
        <p className="text-sm text-gray-500">Tap the mic to start recording</p>
      )}
    </div>
  );
}
