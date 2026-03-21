export default function TranscriptEditor({ transcript, onTranscriptChange, onReRecord, isTypingMode }) {
  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0;
  const charCount = transcript.length;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
      <h2 className="text-lg font-semibold text-white">
        {isTypingMode ? 'Type your mood' : 'Your Transcript'}
      </h2>

      <textarea
        value={transcript}
        onChange={(e) => onTranscriptChange(e.target.value)}
        rows={6}
        className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white text-sm leading-relaxed p-4 resize-y focus:outline-none focus:border-green-500 transition-colors placeholder-gray-500"
        placeholder="Your speech will appear here..."
      />

      <p className="text-xs text-gray-500 self-end -mt-4">
        {wordCount} {wordCount === 1 ? 'word' : 'words'} · {charCount} {charCount === 1 ? 'character' : 'characters'}
      </p>

      <div className="flex gap-4">
        <button
          onClick={onReRecord}
          className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-400/50 hover:border-red-300 py-2 px-5 rounded-full transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
          {isTypingMode ? 'Use mic instead' : 'Re-record'}
        </button>

        <button
          disabled={!transcript.trim()}
          className="text-sm text-white bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed py-2 px-6 rounded-full transition-colors cursor-pointer"
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
