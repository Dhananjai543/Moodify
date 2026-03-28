import json
import time
import requests

from src.handlers.auth import refresh_access_token, SpotifyRevoked
from src.handlers.mood import request_more_songs


SPOTIFY_API_BASE = "https://api.spotify.com/v1"
SPOTIFY_SEARCH_URL = f"{SPOTIFY_API_BASE}/search"

MIN_MATCHED_TRACKS = 5
MAX_RETRIES = 3


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


def _spotify_request(method, url, access_token, refresh_token, **kwargs):
    """HTTP wrapper with token refresh and rate-limit retry."""
    token = access_token
    refreshed = False

    for attempt in range(MAX_RETRIES):
        kwargs["headers"] = {"Authorization": f"Bearer {token}"}
        resp = requests.request(method, url, **kwargs)

        if resp.status_code == 401 and refresh_token and not refreshed:
            token, refresh_token = refresh_access_token(refresh_token)
            refreshed = True
            continue

        if resp.status_code == 403:
            raise SpotifyRevoked()

        if resp.status_code == 429:
            wait = min(int(resp.headers.get("Retry-After", 2 ** attempt)), 10)
            time.sleep(wait)
            continue

        return resp, token

    return resp, token


MIN_MATCH_SCORE = 2


def _score_track(title, artist, track):
    """Score a Spotify track against the AI-suggested title/artist."""
    score = 0
    t_lower = title.lower()
    sp_name = track.get("name", "").lower()

    if t_lower in sp_name or sp_name in t_lower:
        score += 3

    a_lower = artist.lower()
    sp_artists = [a.get("name", "").lower() for a in track.get("artists", [])]
    if any(a_lower in sa or sa in a_lower for sa in sp_artists):
        score += 2

    score += track.get("popularity", 0) / 20
    return score


def _pick_best(title, artist, items):
    """Return highest-scoring track above threshold, or None."""
    best, best_score = None, -1
    for t in items:
        s = _score_track(title, artist, t)
        if s > best_score:
            best, best_score = t, s
    if best_score >= MIN_MATCH_SCORE:
        return best
    return None


def _track_result(track):
    album = track.get("album", {})
    images = album.get("images", [])
    return {
        "uri": track.get("uri"),
        "album_name": album.get("name", ""),
        "album_image": images[0]["url"] if images else "",
    }


def _search_track(title, artist, access_token, refresh_token):
    # Pass 1: strict field search
    params = {"q": f"track:{title} artist:{artist}", "type": "track", "limit": 5}
    resp, token = _spotify_request(
        "GET", SPOTIFY_SEARCH_URL, access_token, refresh_token, params=params
    )
    if resp.status_code == 200:
        items = resp.json().get("tracks", {}).get("items", [])
        best = _pick_best(title, artist, items)
        if best:
            return _track_result(best), token

    # Pass 2: broad keyword search
    params = {"q": f"{title} {artist}", "type": "track", "limit": 10}
    resp, token = _spotify_request(
        "GET", SPOTIFY_SEARCH_URL, access_token, refresh_token, params=params
    )
    if resp.status_code != 200:
        return None, token

    items = resp.json().get("tracks", {}).get("items", [])
    best = _pick_best(title, artist, items)
    if best:
        return _track_result(best), token

    return None, token


def _create_playlist(name, description, access_token, refresh_token):
    url = f"{SPOTIFY_API_BASE}/me/playlists"
    payload = {"name": name, "description": description, "public": False}
    resp, token = _spotify_request(
        "POST", url, access_token, refresh_token, json=payload
    )
    if resp.status_code not in (200, 201):
        return {"_error": resp.status_code, "_detail": resp.text}, token
    return resp.json(), token


def _add_tracks_to_playlist(playlist_id, track_uris, access_token, refresh_token):
    url = f"{SPOTIFY_API_BASE}/playlists/{playlist_id}/items"
    resp, token = _spotify_request(
        "POST", url, access_token, refresh_token, json={"uris": track_uris}
    )
    return resp.status_code in (200, 201), token


def _search_songs(songs, access_token, refresh_token):
    matched = []
    skipped = []
    token = access_token
    for song in songs:
        title = song.get("title", "").strip()
        artist = song.get("artist", "").strip()
        if not title or not artist:
            skipped.append({"title": title, "artist": artist})
            continue
        result, token = _search_track(title, artist, token, refresh_token)
        if result:
            matched.append({
                "title": title,
                "artist": artist,
                "uri": result["uri"],
                "album_name": result["album_name"],
                "album_image": result["album_image"],
            })
        else:
            skipped.append({"title": title, "artist": artist})
    return matched, skipped, token


def create_playlist_handler(event, context):
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    access_token = body.get("access_token", "").strip()
    if not access_token:
        return _build_response(400, {"error": "access_token is required"})

    refresh_token = body.get("refresh_token", "").strip() or None
    mood = body.get("mood")

    songs = body.get("songs")
    if not isinstance(songs, list) or len(songs) == 0:
        return _build_response(400, {"error": "songs list is required and cannot be empty"})

    playlist_name = body.get("playlist_name", "").strip()
    if not playlist_name:
        return _build_response(400, {"error": "playlist_name is required"})

    playlist_description = body.get("playlist_description", "").strip()

    try:
        matched_tracks, skipped, access_token = _search_songs(
            songs, access_token, refresh_token
        )

        if len(matched_tracks) < MIN_MATCHED_TRACKS and isinstance(mood, dict):
            tried_titles = [s.get("title", "") for s in songs]
            extra_songs = request_more_songs(mood, tried_titles)
            if extra_songs:
                extra_matched, extra_skipped, access_token = _search_songs(
                    extra_songs, access_token, refresh_token
                )
                matched_tracks.extend(extra_matched)
                skipped.extend(extra_skipped)

        if not matched_tracks:
            return _build_response(200, {
                "error": "No songs matched on Spotify",
                "matched_tracks": [],
                "skipped": skipped,
            })

        playlist, access_token = _create_playlist(
            playlist_name, playlist_description, access_token, refresh_token
        )
        if "_error" in playlist:
            return _build_response(502, {
                "error": "Failed to create Spotify playlist",
                "spotify_status": playlist["_error"],
                "spotify_detail": playlist["_detail"],
            })

        playlist_id = playlist.get("id")
        track_uris = [t["uri"] for t in matched_tracks]

        added, access_token = _add_tracks_to_playlist(
            playlist_id, track_uris, access_token, refresh_token
        )
        if not added:
            return _build_response(502, {"error": "Failed to add tracks to playlist"})

        result = {
            "playlist_url": playlist.get("external_urls", {}).get("spotify", ""),
            "playlist_id": playlist_id,
            "cover_images": playlist.get("images", []),
            "matched_tracks": matched_tracks,
            "skipped": skipped,
        }

        if access_token != body.get("access_token", "").strip():
            result["new_access_token"] = access_token

        return _build_response(200, result)

    except SpotifyRevoked:
        return _build_response(401, {
            "error": "Spotify access revoked. Please log in again.",
            "code": "REVOKED",
        })
