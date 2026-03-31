import { useState, useEffect, useRef, useCallback } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

const MAX_DURATION = 30;
const BAR_COUNT = 24;

export default function MicButton({ onRecordingComplete, onTypeInstead }) {
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
      <div className="flex flex-col items-center gap-5 max-w-md text-center animate-[fade-in-up_0.6s_ease-out_forwards]">
        <div className="w-18 h-18 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255, 100, 100, 0.08)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-red-400">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium font-headline">Speech recognition not supported</p>
        <p className="text-on-surface-variant text-sm font-body">Your browser doesn't support speech recognition. Try Chrome or Edge.</p>
        <button
          onClick={onTypeInstead}
          className="mt-2 flex items-center gap-2 text-sm text-emerald-glow hover:text-emerald-dim transition-colors cursor-pointer font-body"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm5 1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2H7Zm4 0a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2h-1Zm4 0a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2h-2ZM7 11a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H7Zm-3 5a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H4Zm14 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Z" />
          </svg>
          Type instead
        </button>
      </div>
    );
  }

  if (status === 'processing') {
    return (
      <div className="flex flex-col items-center gap-6 animate-[fade-in-up_0.4s_ease-out_forwards]">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '3px solid transparent',
              borderTopColor: '#00FF87',
              borderRightColor: '#00FF87',
              animation: 'spin-slow 1s linear infinite',
            }}
          />
          <div
            className="absolute inset-2 rounded-full"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(0,255,135,0.3)',
              animation: 'spin-slow 1.5s linear infinite reverse',
            }}
          />
        </div>
        <p className="text-on-surface-variant text-sm font-body">Processing...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {status === 'recording' && (
        <div className="flex items-end gap-[3px] h-12">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-[3px] rounded-full transition-[height] duration-100"
              style={{
                height: `${h}px`,
                background: 'linear-gradient(to top, #00FF87, #a4ffb9)',
                boxShadow: h > 10 ? '0 0 6px rgba(0,255,135,0.3)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      <div className="relative">
        {status === 'recording' && (
          <>
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(0, 255, 135, 0.15)',
                animation: 'ring-expand 2s ease-out infinite',
              }}
            />
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: 'rgba(0, 255, 135, 0.1)',
                animation: 'ring-expand 2s ease-out infinite 0.6s',
              }}
            />
          </>
        )}
        <button
          onClick={status === 'idle' ? startRecording : undefined}
          className={`relative z-10 w-22 h-22 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
            status === 'recording'
              ? ''
              : 'hover:scale-105'
          }`}
          style={
            status === 'recording'
              ? {
                  background: 'linear-gradient(135deg, #00FF87, #00ed7d)',
                  boxShadow: '0 0 30px rgba(0,255,135,0.4), 0 0 60px rgba(0,255,135,0.15)',
                }
              : {
                  background: 'rgba(27, 41, 33, 0.5)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(64, 74, 68, 0.3)',
                }
          }
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-9 h-9 ${status === 'recording' ? 'text-[#004620]' : 'text-on-surface'}`}>
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </button>
      </div>

      {status === 'recording' ? (
        <>
          <p className="text-sm text-on-surface-variant tabular-nums font-body">
            {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
          </p>

          {(finalTranscript || interimTranscript) && (
            <div className="max-w-md w-full px-4 text-center">
              <p className="text-sm leading-relaxed font-body">
                <span className="text-on-surface">{finalTranscript}</span>
                <span className="text-on-surface-variant/50 italic">{interimTranscript}</span>
              </p>
            </div>
          )}

          <button
            onClick={stopRecording}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 px-5 rounded-full transition-all cursor-pointer font-body"
            style={{ border: '1px solid rgba(248, 113, 113, 0.3)' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
            Stop
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-on-surface-variant font-body">Tap the mic to start recording</p>
          <button
            onClick={onTypeInstead}
            className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-emerald-glow transition-colors cursor-pointer font-body"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6Zm5 1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2H7Zm4 0a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2h-1Zm4 0a1 1 0 0 0 0 2h2a1 1 0 1 0 0-2h-2ZM7 11a1 1 0 1 0 0 2h10a1 1 0 1 0 0-2H7Zm-3 5a1 1 0 1 0 0 2h1a1 1 0 1 0 0-2H4Zm14 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Z" />
            </svg>
            Type instead
          </button>
        </>
      )}
    </div>
  );
}
