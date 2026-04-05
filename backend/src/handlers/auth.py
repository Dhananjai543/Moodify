import base64
import json
import logging
import os

import requests

logger = logging.getLogger(__name__)
logger.setLevel(logging.WARNING)

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"

# Optimized: read env vars once at module load instead of on every invocation
SPOTIFY_CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID", "")
SPOTIFY_REDIRECT_URI = os.environ.get("SPOTIFY_REDIRECT_URI", "")

# Optimized: module-level Session reuses TCP connections across warm invocations
_http_session = requests.Session()


class SpotifyRevoked(Exception):
    pass


def refresh_access_token(refresh_token):
    """Refresh token via Spotify API"""
    resp = _http_session.post(SPOTIFY_TOKEN_URL, data={
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": SPOTIFY_CLIENT_ID,
    }, timeout=(5, 10))
    if resp.status_code != 200:
        logger.warning("Spotify token refresh failed: %s", resp.status_code)
        raise SpotifyRevoked()
    data = resp.json()
    return data.get("access_token"), data.get("refresh_token", refresh_token)


def _build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def _parse_body(event):
    body = event.get("body", "")
    if event.get("isBase64Encoded"):
        body = base64.b64decode(body).decode("utf-8")
    return json.loads(body) if body else {}


def token_handler(event, context):
    """Exchange auth code for Spotify tokens"""
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    code = body.get("code")
    code_verifier = body.get("code_verifier")

    if not code or not code_verifier:
        return _build_response(400, {"error": "code and code_verifier are required"})

    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": SPOTIFY_REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "code_verifier": code_verifier,
    }

    # Optimized: session for connection reuse + explicit timeout
    response = _http_session.post(SPOTIFY_TOKEN_URL, data=payload, timeout=(5, 10))
    return _build_response(response.status_code, response.json())


def refresh_handler(event, context):
    """Refresh Spotify access token"""
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    refresh_token = body.get("refresh_token")

    if not refresh_token:
        return _build_response(400, {"error": "refresh_token is required"})

    payload = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": SPOTIFY_CLIENT_ID,
    }

    # Optimized: session for connection reuse + explicit timeout
    response = _http_session.post(SPOTIFY_TOKEN_URL, data=payload, timeout=(5, 10))
    return _build_response(response.status_code, response.json())
