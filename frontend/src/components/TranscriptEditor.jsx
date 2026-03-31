export default function TranscriptEditor({ transcript, onTranscriptChange, onReRecord, onConfirm, isTypingMode }) {
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4 animate-[fade-in-up_0.6s_ease-out_forwards]">
      <h2 className="text-lg font-semibold text-on-surface font-headline">
        {isTypingMode ? 'Type your mood' : 'Your Transcript'}
      </h2>

      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        rows={6}
        className="w-full rounded-xl text-on-surface text-sm leading-relaxed p-5 resize-y focus:outline-none transition-all duration-300 font-body placeholder-on-surface-variant/40"
        style={{
          background: 'rgba(11, 22, 16, 0.8)',
          border: '1px solid rgba(64, 74, 68, 0.2)',
          backdropFilter: 'blur(16px)',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = 'rgba(0, 255, 135, 0.4)';
          e.target.style.boxShadow = '0 0 20px rgba(0, 255, 135, 0.06)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(64, 74, 68, 0.2)';
          e.target.style.boxShadow = 'none';
        }}
        placeholder="Your speech will appear here..."
      />

      <p className="text-xs text-on-surface-variant/60 self-end -mt-4 font-body">
        {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
      </p>

      <div className="flex gap-4">
        <button
          onClick={onReRecord}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 py-2 px-5 rounded-full transition-all cursor-pointer font-body"
          style={{ border: '1px solid rgba(248, 113, 113, 0.3)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
          {isTypingMode ? 'Use mic instead' : 'Re-record'}
        </button>

        <button
          disabled={!transcript.trim()}
          onClick={() => transcript.trim() && onConfirm?.(transcript.trim())}
          className="btn-cta text-sm py-2.5 px-7 rounded-full disabled:opacity-30 disabled:cursor-not-allowed disabled:animate-none cursor-pointer font-body"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
