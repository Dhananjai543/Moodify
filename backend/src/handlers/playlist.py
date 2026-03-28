import json
import requests


SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SPOTIFY_SEARCH_URL = f"{SPOTIFY_API_BASE}/search"


def _build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        },
        "body": json.dumps(body),
    }


def _parse_body(event):
    body = event.get("body", "")
    if event.get("isBase64Encoded"):
        import base64
        body = base64.b64decode(body).decode("utf-8")
    return json.loads(body) if body else {}


def _auth_headers(access_token):
    return {"Authorization": f"Bearer {access_token}"}


# Search Spotify for a track
def _search_track(title, artist, access_token):
    query = f"track:{title} artist:{artist}"
    params = {"q": query, "type": "track", "limit": 1}

    resp = requests.get(SPOTIFY_SEARCH_URL, params=params, headers=_auth_headers(access_token))
    if resp.status_code != 200:
        return None

    tracks = resp.json().get("tracks", {}).get("items", [])
    if not tracks:
        return None

    return tracks[0].get("uri")


# Get current user's Spotify ID
def _get_user_id(access_token):
    resp = requests.get(f"{SPOTIFY_API_BASE}/me", headers=_auth_headers(access_token))
    if resp.status_code != 200:
        return None
    return resp.json().get("id")


# Create playlist in user's account
def _create_playlist(user_id, name, description, access_token):
    url = f"{SPOTIFY_API_BASE}/users/{user_id}/playlists"
    payload = {"name": name, "description": description, "public": False}

    resp = requests.post(url, json=payload, headers=_auth_headers(access_token))
    if resp.status_code not in (200, 201):
        return None
    return resp.json()


# Add tracks to a playlist
def _add_tracks_to_playlist(playlist_id, track_uris, access_token):
    url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/tracks"
    payload = {"uris": track_uris}

    resp = requests.post(url, json=payload, headers=_auth_headers(access_token))
    return resp.status_code in (200, 201)


# Search songs, create playlist, add tracks
def create_playlist_handler(event, context):
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    access_token = body.get("access_token", "").strip()
    if not access_token:
        return _build_response(400, {"error": "access_token is required"})

    songs = body.get("songs")
    if not isinstance(songs, list) or len(songs) == 0:
        return _build_response(400, {"error": "songs list is required and cannot be empty"})

    playlist_name = body.get("playlist_name", "").strip()
    if not playlist_name:
        return _build_response(400, {"error": "playlist_name is required"})

    playlist_description = body.get("playlist_description", "").strip()

    matched_tracks = []
    skipped = []

    for song in songs:
        title = song.get("title", "").strip()
        artist = song.get("artist", "").strip()
        if not title or not artist:
            skipped.append({"title": title, "artist": artist})
            continue

        uri = _search_track(title, artist, access_token)
        if uri:
            matched_tracks.append({"title": title, "artist": artist, "uri": uri})
        else:
            skipped.append({"title": title, "artist": artist})

    if not matched_tracks:
        return _build_response(200, {
            "error": "No songs matched on Spotify",
            "matched_tracks": [],
            "skipped": skipped,
        })

    user_id = _get_user_id(access_token)
    if not user_id:
        return _build_response(401, {"error": "Failed to get Spotify user ID"})

    playlist = _create_playlist(user_id, playlist_name, playlist_description, access_token)
    if not playlist:
        return _build_response(502, {"error": "Failed to create Spotify playlist"})

    playlist_id = playlist.get("id")
    track_uris = [t["uri"] for t in matched_tracks]

    if not _add_tracks_to_playlist(playlist_id, track_uris, access_token):
        return _build_response(502, {"error": "Failed to add tracks to playlist"})

    return _build_response(200, {
        "playlist_url": playlist.get("external_urls", {}).get("spotify", ""),
        "playlist_id": playlist_id,
        "cover_images": playlist.get("images", []),
        "matched_tracks": matched_tracks,
        "skipped": skipped,
    })
