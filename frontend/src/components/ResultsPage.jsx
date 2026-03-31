import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const FUN_LINES = [
  "Your ears are about to thank you!",
  "Vibes? Immaculate. Playlist? Ready.",
  "DJ AI has entered the chat.",
  "Warning: extreme vibes ahead.",
  "Your mood just got a soundtrack!",
];

async function fetchAlbumArt(title, artist, accessToken) {
  const q = encodeURIComponent(`track:${title} artist:${artist}`);
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${q}&type=track&limit=1`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  const data = await res.json();
  const images = data?.tracks?.items?.[0]?.album?.images;
  return images?.find((img) => img.width <= 300)?.url || images?.[0]?.url || null;
}

export default function ResultsPage({ mood, playlistName, playlistDescription, songs, onAddToSpotify, onTryAgain, accessToken }) {
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [addError, setAddError] = useState(null);
  const [albumArts, setAlbumArts] = useState({});
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!songs?.length || !accessToken || fetchedRef.current) return;
    fetchedRef.current = true;

    const BATCH_SIZE = 5;

    async function loadArts() {
      for (let i = 0; i < songs.length; i += BATCH_SIZE) {
        const batch = songs.slice(i, i + BATCH_SIZE);
        const results = await Promise.all(
          batch.map((s, j) =>
            fetchAlbumArt(s.title, s.artist, accessToken).then((url) => [i + j, url]),
          ),
        );
        setAlbumArts((prev) => {
          const next = { ...prev };
          results.forEach(([idx, url]) => { if (url) next[idx] = url; });
          return next;
        });
      }
    }

    loadArts();
  }, [songs, accessToken]);

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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowPopup(true);
    } catch (err) {
      setAddError(err.message || 'Failed to add playlist');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl px-4 py-8 animate-[fade-in-up_0.6s_ease-out_forwards]">
      {/* Mood Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-body">Your mood</p>
        <h2
          className="text-3xl font-bold text-on-surface mb-4 font-headline"
          style={{ textShadow: '0 0 30px rgba(0,255,135,0.15)' }}
        >
          {mood?.primary}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {mood?.keywords?.map((kw) => (
            <span
              key={kw}
              className="text-xs text-on-surface-variant/80 px-3.5 py-1.5 rounded-full font-body"
              style={{
                background: 'rgba(0, 108, 72, 0.2)',
                border: '1px solid rgba(0, 255, 135, 0.08)',
              }}
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Playlist Info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-on-surface font-headline">{playlistName}</h3>
        <p className="text-sm text-on-surface-variant mt-1 font-body">{playlistDescription}</p>
      </div>

      {/* Song List */}
      <ul className="w-full glass-card rounded-2xl overflow-hidden">
        {songs?.map((song, i) => (
          <li
            key={i}
            className="flex items-center gap-4 py-3 px-5 transition-all duration-200 hover:bg-[rgba(0,255,135,0.03)]"
            style={{
              borderBottom: i < songs.length - 1 ? '1px solid rgba(64, 74, 68, 0.1)' : 'none',
              animationDelay: `${i * 0.05}s`,
            }}
          >
            <div className="w-6 text-center text-xs text-on-surface-variant/40 flex-shrink-0 font-body tabular-nums">{i + 1}</div>
            <div className="w-11 h-11 rounded-lg flex-shrink-0 overflow-hidden bg-surface-container-high">
              {albumArts[i] ? (
                <img src={albumArts[i]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-on-surface-variant/30" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-on-surface truncate font-body">{song.title}</p>
              <p className="text-xs text-on-surface-variant/60 truncate font-body">{song.artist}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          onClick={onTryAgain}
          className="btn-ghost text-sm py-2.5 px-6 rounded-full cursor-pointer font-body"
        >
          Try Again
        </button>

        {success ? (
          <a
            href={success.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-cta flex items-center gap-2 text-sm py-3 px-8 rounded-full font-body"
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
            className="btn-cta flex items-center gap-2 text-sm py-3 px-8 rounded-full disabled:opacity-40 disabled:cursor-not-allowed disabled:animate-none cursor-pointer font-body"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            {adding ? 'Adding...' : 'Add to Spotify'}
          </button>
        )}
      </div>

      {addError && (
        <p className="text-sm text-red-400 font-body">{addError}</p>
      )}

      {/* Success Popup — rendered via portal so fixed positioning works regardless of parent transforms */}
      {showPopup && success && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(3, 10, 6, 0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setShowPopup(false)}>
          <div
            className="glass-card rounded-3xl p-10 max-w-sm text-center animate-[scale-in_0.4s_ease-out_forwards]"
            style={{ boxShadow: '0 25px 60px rgba(0,0,0,0.5), 0 0 40px rgba(0,255,135,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-18 h-18 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0, 255, 135, 0.1)' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-9 h-9 text-emerald-glow" style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.4))' }}>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-2 font-headline">Added to Spotify!</h3>
            <p className="text-sm text-on-surface-variant mb-8 font-body">{success.line}</p>
            <div className="flex justify-center gap-3">
              <a
                href={success.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cta text-sm py-2.5 px-7 rounded-full font-body"
              >
                Open in Spotify
              </a>
              <button
                onClick={() => setShowPopup(false)}
                className="btn-ghost text-sm py-2.5 px-5 rounded-full cursor-pointer font-body"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
