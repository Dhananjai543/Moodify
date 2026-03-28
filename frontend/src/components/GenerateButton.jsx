export default function GenerateButton({ transcript, onGenerate, onEdit }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg px-4">
      <h2 className="text-lg font-semibold text-white">Your mood</h2>

      <div className="w-full rounded-lg bg-gray-900 border border-gray-700 p-4 text-sm text-gray-300 leading-relaxed">
        {transcript}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onEdit}
          className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-white py-2 px-5 rounded-full transition-colors cursor-pointer"
        >
          Edit
        </button>
        <button
          onClick={onGenerate}
          className="flex items-center gap-2 text-sm text-black font-semibold bg-[#1DB954] hover:bg-[#1ed760] py-2.5 px-7 rounded-full transition-colors cursor-pointer"
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
