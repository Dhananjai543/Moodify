const MOOD_WORDS = ['feeling', 'vibes', 'rhythm', 'energy', 'melody', 'soul', 'harmony'];

export default function MoodLoader() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <span className="absolute inset-0 rounded-full border-2 border-[#1DB954]/30 animate-[mood-ring_2s_ease-in-out_infinite]" />
        <span className="absolute inset-2 rounded-full border-2 border-[#1DB954]/20 animate-[mood-ring_2s_ease-in-out_infinite_0.4s]" />
        <span className="absolute inset-4 rounded-full border-2 border-[#1DB954]/10 animate-[mood-ring_2s_ease-in-out_infinite_0.8s]" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[#1DB954]">
          <path d="M9 19V6l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      <p className="text-white font-medium text-lg">Reading your mood...</p>

      <div className="flex flex-wrap justify-center gap-2 max-w-xs">
        {MOOD_WORDS.map((word, i) => (
          <span
            key={word}
            className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full animate-[mood-word_2.5s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            {word}
          </span>
        ))}
      </div>
    </div>
  );
}
