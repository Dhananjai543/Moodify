export default function GenerateButton({ transcript, onGenerate, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <h2 className="text-lg font-semibold text-on-surface font-headline">Your mood</h2>

      <div
        className="glass-card w-full rounded-xl p-5 text-sm text-on-surface/80 leading-relaxed font-body"
      >
        {transcript}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onEdit}
          className="btn-ghost text-sm py-2.5 px-6 rounded-full cursor-pointer font-body"
        >
          Edit
        </button>
        <button
          onClick={onGenerate}
          className="btn-cta flex items-center gap-2 text-sm py-3 px-8 rounded-full cursor-pointer font-body"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M9 19V6l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
          Generate Playlist
        </button>
      </div>
    </div>
  );
}
