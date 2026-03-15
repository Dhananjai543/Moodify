# Moodify

Speak your mood, get a Spotify playlist.

## Architecture

```
User → React (Vite) → API Gateway → AWS Lambda (Python 3.12) → Amazon Bedrock (Claude Haiku)
                                                               → Spotify Web API
```

## Project Structure

```
frontend/   → React + Vite + Tailwind CSS
backend/    → AWS SAM (Python 3.12 Lambda)
```

## Setup

### Frontend

```bash
cd frontend
npm install
```

Add your Spotify Client ID in `frontend/.env`:

```
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
```

Make sure `VITE_SPOTIFY_REDIRECT_URI` matches the redirect URI configured in your Spotify Developer Dashboard.

```bash
npm run dev
```

Runs on `http://localhost:5173`

### Backend

Requires [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html) and Python 3.12.

```bash
cd backend
sam build
sam local start-api
```

## Story 1.3 — Spotify OAuth 2.0 (PKCE) Flow

### Dependencies added

```bash
npm install react-router-dom
```

### What it does

- Spotify login button on the home page
- PKCE authorization flow (code verifier + challenge)
- OAuth callback handling at `/callback`
- Token exchange directly with Spotify (no backend needed for PKCE)
- Tokens stored in memory (not localStorage)
- Displays logged-in user's Spotify display name and profile picture
