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
