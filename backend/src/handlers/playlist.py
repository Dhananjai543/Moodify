import json
import requests


SPOTIFY_SEARCH_URL = "https://api.spotify.com/v1/search"


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

# Search Spotify for a track
def _search_track(title, artist, access_token):
    query = f"track:{title} artist:{artist}"
    params = {"q": query, "type": "track", "limit": 1}
    headers = {"Authorization": f"Bearer {access_token}"}

    resp = requests.get(SPOTIFY_SEARCH_URL, params=params, headers=headers)
    if resp.status_code != 200:
        return None

    tracks = resp.json().get("tracks", {}).get("items", [])
    if not tracks:
        return None

    return tracks[0].get("uri")


# Search Spotify for Bedrock-recommended songs.
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

    return _build_response(200, {
        "matched_tracks": matched_tracks,
        "skipped": skipped,
    })
