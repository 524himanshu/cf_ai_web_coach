# CF AI Career Coach ⚡

An AI-powered career coaching chatbot built on Cloudflare's developer platform.

## What it does

Users paste their resume and target role. The AI coach analyzes the profile and provides:
- Resume score out of 10
- Top 3 strengths for the target role
- Top 3 gaps or weaknesses
- Specific action items to improve chances
- Multi-turn conversation for follow-up questions

The conversation is fully stateful — it remembers your resume, role, and entire chat history within a session using Cloudflare Durable Objects storage.

## Live Demo

🔗 https://cf-ai-web-coach.himanshu524.workers.dev

## Tech Stack

| Component | Technology |
|-----------|------------|
| LLM | Llama 3.3 70B via Cloudflare Workers AI |
| Workflow | Cloudflare Worker (API routing) |
| Memory/State | Cloudflare Durable Objects (persistent storage API) |
| Frontend | HTML/CSS/JS served via Cloudflare Assets |
| Deployment | Cloudflare Workers |

## How to Run

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

- `POST /start` — Submit resume + target role `{ resume, targetRole, sessionId }`
- `POST /chat` — Send follow-up message `{ message, sessionId }`
- `POST /clear` — Clear session `{ sessionId }`

## Architecture
```
User (Browser)
     ↓
Cloudflare Assets (HTML/CSS/JS)
     ↓
Cloudflare Worker (API routing)
     ↓
Durable Object (Persistent session memory)
     ↓
Workers AI — Llama 3.3 70B
```