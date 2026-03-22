import json
import os
import boto3
from botocore.exceptions import ClientError


BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")
BEDROCK_REGION = os.environ.get("AWS_BEDROCK_REGION", "us-east-1")

bedrock_client = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)


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


def analyze_mood_handler(event, context):
    """Analyze mood from user text via Bedrock"""
    try:
        body = _parse_body(event)
    except (json.JSONDecodeError, Exception):
        return _build_response(400, {"error": "Invalid request body"})

    text = body.get("text", "").strip()
    if not text:
        return _build_response(400, {"error": "text is required"})

    payload = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1024,
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
        return _build_response(200, result)

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        error_msg = e.response["Error"]["Message"]
        return _build_response(502, {"error": f"Bedrock error: {error_code} - {error_msg}"})
    except Exception as e:
        return _build_response(500, {"error": f"Internal error: {str(e)}"})
