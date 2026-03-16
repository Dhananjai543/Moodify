import json
import os
import requests

SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"


def _build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body),
    }


def _parse_body(event):
    body = event.get("body", "")
    if event.get("isBase64Encoded"):
        import base64
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
        "redirect_uri": os.environ.get("SPOTIFY_REDIRECT_URI"),
        "client_id": os.environ.get("SPOTIFY_CLIENT_ID"),
        "code_verifier": code_verifier,
    }

    response = requests.post(SPOTIFY_TOKEN_URL, data=payload)
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
        "client_id": os.environ.get("SPOTIFY_CLIENT_ID"),
    }

    response = requests.post(SPOTIFY_TOKEN_URL, data=payload)
    return _build_response(response.status_code, response.json())
