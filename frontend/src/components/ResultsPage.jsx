import { useState } from 'react';

const FUN_LINES = [
  "Your ears are about to thank you!",
  "Vibes? Immaculate. Playlist? Ready.",
  "DJ AI has entered the chat.",
  "Warning: extreme vibes ahead.",
  "Your mood just got a soundtrack!",
];

export default function ResultsPage({ mood, playlistName, playlistDescription, songs, onAddToSpotify, onTryAgain }) {
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [addError, setAddError] = useState(null);

  const handleAdd = async () => {
    setAdding(true);
    setAddError(null);
    try {
      const result = await onAddToSpotify();
      const data = {
        url: result.playlist_url,
        line: FUN_LINES[Math.floor(Math.random() * FUN_LINES.length)],
      };
      setSuccess(data);
      setShowPopup(true);
    } catch (err) {
      setAddError(err.message || 'Failed to add playlist');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4 py-8">
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

      <div className="text-center">
        <h3 className="text-lg font-semibold text-white">{playlistName}</h3>
        <p className="text-sm text-gray-400 mt-1">{playlistDescription}</p>
      </div>

      <ul className="w-full divide-y divide-gray-800">
        {songs?.map((song, i) => (
          <li key={i} className="flex items-center gap-4 py-3">
            <div className="w-8 text-center text-xs text-gray-500 flex-shrink-0">{i + 1}</div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-white truncate">{song.title}</p>
              <p className="text-xs text-gray-400 truncate">{song.artist}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex gap-4 pt-2">
        <button
          onClick={onTryAgain}
          className="text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-white py-2 px-5 rounded-full transition-colors cursor-pointer"
        >
          Try Again
        </button>

        {success ? (
          <a
            href={success.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-black font-semibold bg-[#1DB954] hover:bg-[#1ed760] py-2.5 px-7 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            Open in Spotify
          </a>
        ) : (
          <button
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 text-sm text-black font-semibold bg-[#1DB954] hover:bg-[#1ed760] disabled:opacity-60 disabled:cursor-not-allowed py-2.5 px-7 rounded-full transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {adding ? 'Adding...' : 'Add to Spotify'}
          </button>
        )}
      </div>

      {addError && (
        <p className="text-sm text-red-400">{addError}</p>
      )}

      {showPopup && success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowPopup(false)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#1DB954]">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Added to Spotify!</h3>
            <p className="text-sm text-gray-400 mb-6">{success.line}</p>
            <div className="flex justify-center gap-3">
              <a
                href={success.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-black font-semibold bg-[#1DB954] hover:bg-[#1ed760] py-2 px-6 rounded-full transition-colors"
              >
                Open in Spotify
              </a>
              <button
                onClick={() => setShowPopup(false)}
                className="text-sm text-gray-400 hover:text-white py-2 px-4 rounded-full transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
