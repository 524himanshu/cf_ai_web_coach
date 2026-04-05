# CF AI Web Coach ⚡

An AI-powered web performance analyzer built on Cloudflare's developer platform.

## What it does

Users can type a website URL or ask performance-related questions in a chat interface. The AI analyzes and returns:
- Specific performance issues
- Speed optimization suggestions
- UX improvements
- Cloudflare-specific recommendations (CDN, caching, Workers)

The conversation is stateful — it remembers your previous messages within a session.

## Live Demo

🔗 https://cf-ai-web-coach.himanshu524.workers.dev

## Tech Stack

| Component | Technology |
|-----------|------------|
| LLM | Llama 3.3 70B via Cloudflare Workers AI |
| Workflow | Cloudflare Worker (API routing) |
| Memory/State | Cloudflare Durable Objects |
| Frontend | HTML/CSS/JS served via Cloudflare Assets |
| Deployment | Cloudflare Workers |

## How to Run Locally

### Prerequisites
- Node.js v18+
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account

### Steps
```bash
git clone https://github.com/524himanshu/cf_ai_web_coach.git
cd cf_ai_web_coach
npm install
wrangler login
wrangler deploy
```

Then open the deployed URL in your browser.

## API Endpoints

- `POST /chat` — Send a message `{ message, sessionId }`
- `POST /clear` — Clear session history `{ sessionId }`

## Architecture
```
User (Browser)
     ↓
Cloudflare Pages (HTML/CSS/JS)
     ↓
Cloudflare Worker (API)
     ↓
Durable Object (Session Memory)
     ↓
Workers AI — Llama 3.3
