import json
import os
import re
import boto3
from botocore.exceptions import ClientError


BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "amazon.nova-pro-v1:0")
BEDROCK_REGION = os.environ.get("AWS_BEDROCK_REGION", "us-east-1")

MAX_INPUT_CHARS = 500

SYSTEM_PROMPT = """You are a music mood analyst. Analyze the emotional content of user text and recommend real songs that match the mood.

Given a user's message, you must:
1. Identify the primary mood from the text.
2. Map the mood to music attributes:
   - energy: float from 0.0 (very low) to 1.0 (very high)
   - valence: float from 0.0 (very negative/sad) to 1.0 (very positive/happy)
   - keywords: list of 3–6 descriptive mood keywords
3. Generate a creative playlist name and a short one-line description that captures the vibe.
4. Suggest 20–25 real songs that match the mood. Each song must:
   - Be a real, well-known song that exists on Spotify
   - Include the song title, artist name, and a brief reason (1 sentence)
   - Be diverse across genres, eras, and artists — do not repeat artists more than twice

Rules:
- For vague or ambiguous input, use your best judgment and return reasonable defaults.
- For nonsensical input (random characters, gibberish), return a neutral mood with general feel-good songs.
- NEVER explain your reasoning. NEVER use markdown code fences.
- Respond ONLY with a single valid JSON object matching this exact schema:

{
  "mood": {
    "primary": "string",
    "energy": 0.0,
    "valence": 0.0,
    "keywords": ["string"]
  },
  "playlist_name": "string",
  "playlist_description": "string",
  "songs": [
    { "title": "string", "artist": "string", "reason": "string" }
  ]
}"""

_bedrock_client = None


def _get_bedrock_client():
    global _bedrock_client
    if _bedrock_client is None:
        _bedrock_client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)
    return _bedrock_client


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


def _extract_json(text):
    """Extract the first JSON object from a string, even if surrounded by stray text."""
    # Try direct parse first
    try:
        return json.loads(text.strip())
    except json.JSONDecodeError:
        pass

    # Fallback: find the outermost { ... } block
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            pass

    return None


def _validate_response(data):
    """Validate and sanitize Bedrock mood response."""
    mood = data.get("mood")
    if not isinstance(mood, dict):
        raise ValueError("Missing mood object")
    if not isinstance(mood.get("primary"), str) or not mood["primary"]:
        raise ValueError("Missing mood.primary")
    if not isinstance(mood.get("keywords"), list) or not mood["keywords"]:
        raise ValueError("Missing mood.keywords")

    mood["energy"] = max(0.0, min(1.0, float(mood.get("energy", 0.5))))
    mood["valence"] = max(0.0, min(1.0, float(mood.get("valence", 0.5))))

    if not isinstance(data.get("playlist_name"), str) or not data["playlist_name"]:
        raise ValueError("Missing playlist_name")
    if not isinstance(data.get("playlist_description"), str) or not data["playlist_description"]:
        raise ValueError("Missing playlist_description")

    songs = data.get("songs")
    if not isinstance(songs, list) or len(songs) == 0:
        raise ValueError("Missing or empty songs list")
    for i, song in enumerate(songs):
        if not isinstance(song, dict):
            raise ValueError(f"songs[{i}] is not an object")
        for field in ("title", "artist", "reason"):
            if not isinstance(song.get(field), str) or not song[field]:
                raise ValueError(f"songs[{i}] missing {field}")

    return {
        "mood": {
            "primary": mood["primary"],
            "energy": mood["energy"],
            "valence": mood["valence"],
            "keywords": mood["keywords"],
        },
        "playlist_name": data["playlist_name"],
        "playlist_description": data["playlist_description"],
        "songs": [
            {"title": s["title"], "artist": s["artist"], "reason": s["reason"]}
            for s in songs
        ],
    }


def request_more_songs(mood, exclude_titles):
    """Ask Bedrock for more songs"""
    exclude_list = ", ".join(f'"{t}"' for t in exclude_titles)
    prompt = (
        f"The user's mood is: {mood.get('primary', 'neutral')} "
        f"(energy={mood.get('energy', 0.5)}, valence={mood.get('valence', 0.5)}, "
        f"keywords={mood.get('keywords', [])}).\n"
        f"Suggest 10 more real songs that match this mood. "
        f"Do NOT include these already-tried songs: [{exclude_list}].\n"
        f"Respond ONLY with a JSON object: {{\"songs\": [{{\"title\": \"...\", \"artist\": \"...\", \"reason\": \"...\"}}]}}"
    )
    payload = {
        "system": [{"text": "You are a music recommendation engine. Respond ONLY with valid JSON."}],
        "messages": [{"role": "user", "content": [{"text": prompt}]}],
        "inferenceConfig": {"maxTokens": 2048, "temperature": 0.7},
    }
    try:
        resp = _get_bedrock_client().invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(payload),
        )
        result = json.loads(resp["body"].read())
        raw = result["output"]["message"]["content"][0]["text"]
        parsed = _extract_json(raw)
        if parsed and isinstance(parsed.get("songs"), list):
            return parsed["songs"]
    except Exception:
        pass
    return []


def analyze_mood_handler(event, context):
    """Analyze mood from user text via Bedrock Claude Haiku."""
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    text = body.get("text", "").strip()
    if not text:
        return _build_response(400, {"error": "text is required"})

    # Edge case: too short (fewer than 2 words)
    word_count = len(text.split())
    if word_count < 2:
        return _build_response(
            400,
            {"error": "Input is too short. Please describe your mood in at least 2 words."},
        )

    # Edge case: too long — truncate to control cost
    if len(text) > MAX_INPUT_CHARS:
        text = text[:MAX_INPUT_CHARS]

    payload = {
        "system": [{"text": SYSTEM_PROMPT}],
        "messages": [
            {
                "role": "user",
                "content": [{"text": text}],
            }
        ],
        "inferenceConfig": {
            "maxTokens": 4096,
            "temperature": 0.7,
        },
    }

    try:
        response = _get_bedrock_client().invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(payload),
        )

        result = json.loads(response["body"].read())

        raw_text = result["output"]["message"]["content"][0]["text"]

        mood_analysis = _extract_json(raw_text)
        if mood_analysis is None:
            return _build_response(
                502,
                {"error": "Failed to parse mood analysis from model response"},
            )

        try:
            validated = _validate_response(mood_analysis)
        except (ValueError, TypeError, KeyError) as e:
            return _build_response(502, {"error": f"Invalid model response: {str(e)}"})

        return _build_response(200, validated)

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_msg = e.response["Error"]["Message"]
        return _build_response(502, {"error": f"Bedrock error: {error_code} - {error_msg}"})
    except Exception as e:
        return _build_response(500, {"error": f"Internal error: {str(e)}"})
