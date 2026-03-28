export default function ResultsPage({ mood, playlistName, playlistDescription, playlistUrl, tracks, onTryAgain }) {
  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4 py-8">
      {/* Mood analysis */}
      <div className="text-center">
        <p className="text-sm uppercase tracking-widest text-gray-500 mb-1">Your mood</p>
        <h2 className="text-2xl font-bold text-white mb-3">{mood?.primary}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {mood?.keywords?.map((kw) => (
            <span key={kw} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Playlist info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{playlistName}</h3>
        <p className="text-sm text-gray-400 mt-1">{playlistDescription}</p>
      </div>

      {/* Song list */}
      <ul className="w-full divide-y divide-gray-800">
        {tracks?.map((track, i) => (
          <li key={track.uri || i} className="flex items-center gap-4 py-3">
            {track.album_image ? (
              <img
                src={track.album_image}
                alt={track.album_name}
                className="w-12 h-12 rounded object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gray-800 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-sm text-white truncate">{track.title}</p>
              <p className="text-xs text-gray-400 truncate">{track.artist}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onTryAgain}
          className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-white py-2 px-5 rounded-full transition-colors cursor-pointer"
        >
          Try Again
        </button>
        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-black font-semibold bg-[#1DB954] hover:bg-[#1ed760] py-2.5 px-7 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Open in Spotify
        </a>
      </div>
    </div>
  );
}
