const MOOD_WORDS = ['feeling', 'vibes', 'rhythm', 'energy', 'melody', 'soul', 'harmony'];

export default function MoodLoader() {
  return (
    <div className="flex flex-col items-center gap-10 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Cinematic orbital rings */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid rgba(0, 255, 135, 0.25)',
            animation: 'mood-ring 2s ease-in-out infinite',
          }}
        />
        <span
          className="absolute inset-2 rounded-full"
          style={{
            border: '2px solid rgba(0, 255, 135, 0.15)',
            animation: 'mood-ring 2s ease-in-out infinite 0.4s',
          }}
        />
        <span
          className="absolute inset-4 rounded-full"
          style={{
            border: '2px solid rgba(0, 255, 135, 0.08)',
            animation: 'mood-ring 2s ease-in-out infinite 0.8s',
          }}
        />
        {/* Rotating orbital */}
        <div
          className="absolute inset-[-8px] rounded-full"
          style={{
            border: '1px solid transparent',
            borderTopColor: 'rgba(0, 255, 135, 0.4)',
            animation: 'spin-slow 3s linear infinite',
          }}
        />
        <div
          className="absolute inset-[-16px] rounded-full"
          style={{
            border: '1px solid transparent',
            borderBottomColor: 'rgba(164, 255, 185, 0.2)',
            animation: 'spin-slow 5s linear infinite reverse',
          }}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 12px rgba(0,255,135,0.4))' }}>
          <path d="M9 19V6l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <p className="text-on-surface font-headline font-medium text-xl" style={{ textShadow: '0 0 30px rgba(0,255,135,0.2)' }}>
        Reading your mood...
      </p>

      <div className="flex flex-wrap justify-center gap-2.5 max-w-xs">
        {MOOD_WORDS.map((word, i) => (
          <span
            key={word}
            className="text-xs text-on-surface-variant px-4 py-1.5 rounded-full animate-[mood-word_2.5s_ease-in-out_infinite] font-body"
            style={{
              animationDelay: `${i * 0.3}s`,
              background: 'rgba(27, 41, 33, 0.4)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(64, 74, 68, 0.1)',
            }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
