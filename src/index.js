import { DurableObject } from "cloudflare:workers";

export class CareerSession extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
  }

  async setProfile(resume, targetRole) {
    await this.ctx.storage.put("resume", resume);
    await this.ctx.storage.put("targetRole", targetRole);
  }

  async getProfile() {
    const resume = await this.ctx.storage.get("resume");
    const targetRole = await this.ctx.storage.get("targetRole");
    return { resume, targetRole };
  }

  async addMessage(role, content) {
    let history = (await this.ctx.storage.get("history")) || [];
    history.push({ role, content });
    if (history.length > 30) history = history.slice(-30);
    await this.ctx.storage.put("history", history);
  }

  async getHistory() {
    return (await this.ctx.storage.get("history")) || [];
  }

  async clearSession() {
    await this.ctx.storage.deleteAll();
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

    if (url.pathname === "/start" && request.method === "POST") {
      const { resume, targetRole, sessionId } = await request.json();

      const id = env.CAREER_SESSION.idFromName(sessionId || "default");
      const session = env.CAREER_SESSION.get(id);

      await session.clearSession();
      await session.setProfile(resume, targetRole);

      const systemPrompt = `You are an expert AI career coach with 20 years of experience in tech hiring.
Your job is to give honest, actionable, and encouraging career advice.
Always structure your responses clearly with sections and bullet points.
Be direct but supportive. Focus on what will actually help the candidate land the job.`;

      const firstMessage = `Here is my resume:\n\n${resume}\n\nI am targeting: ${targetRole}\n\nPlease analyze my resume and give me:
1. A resume score out of 10
2. My top 3 strengths for this role
3. My top 3 gaps or weaknesses
4. 3 specific action items to improve my chances
Be honest and specific.`;

      await session.addMessage("user", firstMessage);

      const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        system: systemPrompt,
        messages: [{ role: "user", content: firstMessage }],
        max_tokens: 2048,
      });

      const reply = aiResponse.response;
      await session.addMessage("assistant", reply);

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/chat" && request.method === "POST") {
      const { message, sessionId } = await request.json();

      const id = env.CAREER_SESSION.idFromName(sessionId || "default");
      const session = env.CAREER_SESSION.get(id);

      const profile = await session.getProfile();
      const history = await session.getHistory();

      await session.addMessage("user", message);

      const systemPrompt = `You are an expert AI career coach with 20 years of experience in tech hiring.
The candidate is targeting: ${profile?.targetRole || "a tech role"}.
You have already analyzed their resume. Continue coaching them based on the conversation history.
Be direct, specific, and actionable. Use bullet points where helpful.`;

      const messages = history.map((h) => ({
        role: h.role,
        content: h.content,
      }));

      messages.push({ role: "user", content: message });

      const aiResponse = await env.AI.run("@cf/meta/llama-3.3-70b-instruct-fp8-fast", {
        system: systemPrompt,
        messages: messages,
        max_tokens: 2048,
      });	

      const reply = aiResponse.response;
      await session.addMessage("assistant", reply);

      return new Response(JSON.stringify({ reply }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (url.pathname === "/clear" && request.method === "POST") {
      const { sessionId } = await request.json();
      const id = env.CAREER_SESSION.idFromName(sessionId || "default");
      const session = env.CAREER_SESSION.get(id);
      await session.clearSession();
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response("CF AI Career Coach API", { headers: corsHeaders });
  },
};