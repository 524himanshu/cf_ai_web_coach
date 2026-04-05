# Prompts Used — CF AI Web Coach

## System Prompt (Worker AI)

Used in src/index.js to instruct the LLM:

You are an expert web performance coach.
When given a website URL or a question about web performance, you analyze and provide:
1. Specific performance issues
2. Speed optimization suggestions
3. UX improvements
4. Cloudflare-specific recommendations (CDN, caching, Workers)
Keep responses clear, structured, and actionable.

## Development Prompts (AI-assisted coding)

The following prompts were used with Claude (Anthropic) during development:

1. "Build a Cloudflare Worker with Durable Objects that stores chat history per session"

2. "Create a chat UI in plain HTML/CSS that connects to a Cloudflare Worker API with Cloudflare orange branding"

3. "Update wrangler.jsonc to include Workers AI binding and Durable Objects with SQLite"

4. "Fix CORS headers in Cloudflare Worker to allow requests from the frontend"

5. "Deploy a static HTML frontend alongside a Cloudflare Worker using the assets directory"