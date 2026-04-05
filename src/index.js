import { DurableObject } from "cloudflare:workers";

export class ChatSession extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.history = [];
  }

  async addMessage(role, content) {
    this.history.push({ role, content });
    if (this.history.length > 20) {
      this.history = this.history.slice(-20);
    }
  }

  async getHistory() {
    return this.history;
  }

  async clearHistory() {
    this.history = [];
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      const { message, sessionId } = await request.json();

      const id = env.CHAT_SESSION.idFromName(sessionId || "default");
      const session = env.CHAT_SESSION.get(id);

      await session.addMessage("user", message);
      const history = await session.getHistory();

      const systemPrompt = `You are an expert web performance coach. 
When given a website URL or a question about web performance, you analyze and provide:
1. Specific performance issues
2. Speed optimization suggestions  
3. UX improvements
4. Cloudflare-specific recommendations (CDN, caching, Workers)
Keep responses clear, structured, and actionable.`;

      const messages = history.map((h) => ({
        role: h.role,
        content: h.content,
      }));

      const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        system: systemPrompt,
        messages: messages,
      });

      const reply = aiResponse.response;
      await session.addMessage("assistant", reply);

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/clear" && request.method === "POST") {
      const { sessionId } = await request.json();
      const id = env.CHAT_SESSION.idFromName(sessionId || "default");
      const session = env.CHAT_SESSION.get(id);
      await session.clearHistory();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("CF AI Web Coach API", { headers: corsHeaders });
  },
};