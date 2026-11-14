import assistant from "@/content/assistant.json";

// "Ask IHBNF" endpoint. Works with any OpenAI-compatible Chat Completions API.
// Required env (set in Vercel): ASK_AI_API_KEY, ASK_AI_MODEL. Optional: ASK_AI_BASE_URL.
// If they're missing the endpoint returns 503 and the site keeps working without it.

type Msg = { role: "user" | "assistant"; content: string };

const MAX_MESSAGES = 10;
const MAX_CHARS = 600;
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

function clean(input: unknown): Msg[] | null {
  if (!Array.isArray(input) || input.length === 0) return null;
  const msgs = input.slice(-MAX_MESSAGES).filter(
    (m): m is Msg => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string",
  );
  if (msgs.length === 0 || msgs[msgs.length - 1].role !== "user") return null;
  return msgs.map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));
}

export async function POST(req: Request) {
  const key = process.env.ASK_AI_API_KEY;
  const model = process.env.ASK_AI_MODEL;
  if (!key || !model) return Response.json({ error: "Assistant is not configured." }, { status: 503 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return Response.json({ error: "Too many messages. Try again in a minute." }, { status: 429 });

  const body = await req.json().catch(() => null);
  const messages = clean(body?.messages);
  if (!messages) return Response.json({ error: "Invalid request." }, { status: 400 });

  const base = (process.env.ASK_AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const upstream = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      stream: true,
      messages: [{ role: "system", content: assistant.systemPrompt }, ...messages],
    }),
  }).catch(() => null);
  if (!upstream?.ok || !upstream.body) return Response.json({ error: "Assistant is unavailable." }, { status: 502 });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";

  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) return controller.close();
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const data = line.replace(/^data:\s*/, "").trim();
        if (!data || data === "[DONE]" || !line.startsWith("data:")) continue;
        try {
          const delta = JSON.parse(data).choices?.[0]?.delta?.content;
          if (delta) controller.enqueue(encoder.encode(delta));
        } catch {}
      }
    },
    cancel() {
      reader.cancel();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no" },
  });
}
