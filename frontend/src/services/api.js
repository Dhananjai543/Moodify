const API_URL = import.meta.env.VITE_API_URL;

export async function analyzeMood(text) {
  const res = await fetch(`${API_URL}/analyze-mood`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  const data = await res.json();
  if (!res.ok || data.error) {
    const err = new Error(data.error || `Mood analysis failed (${res.status})`);
    err.code = data.code;
    throw err;
  }
  return data;
}

export async function createPlaylist({ access_token, refresh_token, songs, playlist_name, playlist_description, mood }) {
  const res = await fetch(`${API_URL}/create-playlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ access_token, refresh_token, songs, playlist_name, playlist_description, mood }),
  });

  const data = await res.json();
  if (!res.ok || (data.error && !data.matched_tracks?.length)) {
    const err = new Error(data.error || `Playlist creation failed (${res.status})`);
    err.code = data.code;
    throw err;
  }
  return data;
}
