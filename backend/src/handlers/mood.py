import json
import os
import re
import boto3
from botocore.exceptions import ClientError


BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
BEDROCK_REGION = os.environ.get("AWS_BEDROCK_REGION", "ap-south-1")

MAX_INPUT_CHARS = 500

SYSTEM_PROMPT = """You are a music mood analyst. Your job is to analyze the emotional content of user text, map it to music attributes, and recommend real songs that match the mood.

Given a user's message, you must:
1. Identify the primary mood and an optional secondary mood from the text.
2. Extract contextual cues — weather, time of day, activity, and memories — if mentioned or strongly implied.
3. Map the mood to music attributes:
   - energy: a float from 0.0 (very low energy) to 1.0 (very high energy)
   - valence: a float from 0.0 (very negative/sad) to 1.0 (very positive/happy)
   - tempo_range: an object with "min" and "max" BPM (integers)
   - genres: a list of 2–4 relevant music genre strings
   - keywords: a list of 3–6 descriptive mood keyword strings
4. Suggest 20–25 real songs that match the mood. Each song must:
   - Be a real, well-known song that exists on Spotify
   - Include the song title, artist name, and a brief reason (1 sentence) for why it fits the mood
   - Be diverse across genres, eras, and artists — do not repeat artists more than twice

Rules:
- For vague or ambiguous input, use your best judgment and return reasonable defaults.
- For truly nonsensical input (random characters, gibberish), return a neutral/default mood with general feel-good songs.
- NEVER explain your reasoning. NEVER use markdown code fences.
- Respond ONLY with a single valid JSON object matching this exact schema:

{
  "mood": {
    "primary": "string",
    "secondary": "string or null",
    "energy": 0.0,
    "valence": 0.0,
    "tempo_range": { "min": 0, "max": 0 },
    "genres": ["string"],
    "keywords": ["string"]
  },
  "context": {
    "weather": "string or null",
    "time_of_day": "string or null",
    "activity": "string or null",
    "memories": "string or null"
  },
  "songs": [
    { "title": "string", "artist": "string", "reason": "string" }
  ]
}"""

bedrock_client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)


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
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 4096,
        "system": SYSTEM_PROMPT,
        "messages": [
            {
                "role": "user",
                "content": text,
            }
        ],
    }

    try:
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(payload),
        )

        result = json.loads(response["body"].read())

        # Extract the text content from Claude's response
        raw_text = result["content"][0]["text"]

        mood_analysis = _extract_json(raw_text)
        if mood_analysis is None:
            return _build_response(
                502,
                {"error": "Failed to parse mood analysis from model response", "raw": raw_text},
            )

        return _build_response(200, mood_analysis)

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_msg = e.response["Error"]["Message"]
        return _build_response(502, {"error": f"Bedrock error: {error_code} - {error_msg}"})
    except Exception as e:
        return _build_response(500, {"error": f"Internal error: {str(e)}"})
