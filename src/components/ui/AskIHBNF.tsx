"use client";

import { useEffect, useRef, useState } from "react";
import { Mark } from "@/components/layout/Logo";

type Msg = { role: "user" | "assistant"; content: string };

const STORAGE = "ask-ihbnf";
const suggestions = ["What is Why Henry about?", "What is Unfiltr?", "Who is Javier Huertas?", "How do I get in touch?"];

// Rendered only when NEXT_PUBLIC_ASK_IHBNF_ENABLED is "true" (see layout.tsx).
export function AskIHBNF() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE);
    if (!saved) return;
    try {
      setMessages(JSON.parse(saved));
    } catch {
      sessionStorage.removeItem(STORAGE);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE, JSON.stringify(messages));
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || busy) return;
    const history: Msg[] = [...messages, { role: "user", content: q }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-10) }),
      });
      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? data.detail ?? "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        answer += decoder.decode(value, { stream: true });
        setMessages([...history, { role: "assistant", content: answer }]);
      }
      if (!answer) throw new Error("No answer came back. Please try again.");
    } catch (e) {
      setMessages(history);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
      {open && (
        <section
          role="dialog"
          aria-label="Ask IHBNF"
          data-testid="ask-panel"
          className="fixed inset-x-3 bottom-3 flex max-h-[78svh] flex-col overflow-hidden rounded-3xl border border-bone/12 bg-coal/95 shadow-[0_30px_100px_-20px_rgb(0_0_0/0.9)] backdrop-blur-xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[560px] sm:w-[400px]"
        >
          <header className="flex items-center justify-between border-b border-bone/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <Mark className="h-6 w-6 text-gold" />
              <div>
                <p className="text-sm font-semibold tracking-[0.2em]">ASK IHBNF</p>
                <p className="text-xs text-mute">Questions about the books, Unfiltr and Javier</p>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close assistant" data-testid="ask-close-btn" className="flex h-10 w-10 items-center justify-center rounded-full text-mute hover:bg-bone/5 hover:text-bone">
              <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </button>
          </header>

          <div ref={listRef} aria-live="polite" data-testid="ask-messages" className="flex-1 space-y-3 overflow-y-auto px-5 py-5">
            {messages.length === 0 && (
              <div>
                <p className="font-display text-2xl leading-snug">Hi. Ask anything about IHBNF.</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={s} type="button" onClick={() => send(s)} data-testid={`ask-suggestion-${i}`} className="rounded-full border border-bone/15 px-3.5 py-2 text-left text-sm text-bone/85 transition-colors hover:border-gold/50 hover:text-bone">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <p
                key={i}
                data-testid={`ask-message-${m.role}`}
                className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed ${
                  m.role === "user" ? "ml-auto rounded-br-md bg-bone text-ink" : "rounded-bl-md bg-ash text-bone/90"
                }`}
              >
                {m.content || <span className="inline-flex gap-1" aria-label="Thinking"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:150ms]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold [animation-delay:300ms]" /></span>}
              </p>
            ))}
            {error && <p role="alert" data-testid="ask-error" className="text-sm text-amber">{error}</p>}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-bone/10 p-3"
          >
            <label htmlFor="ask-input" className="sr-only">Your question</label>
            <input
              id="ask-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={600}
              placeholder="Ask a question"
              autoComplete="off"
              data-testid="ask-input"
              className="min-h-12 flex-1 rounded-full bg-ink px-4 text-base text-bone placeholder:text-mute focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            />
            <button type="submit" disabled={busy || !input.trim()} data-testid="ask-send-btn" className="btn btn-gold h-12 px-5 disabled:opacity-40">
              Send
            </button>
          </form>
          <p className="px-5 pb-3 text-[0.7rem] text-mute">AI answers can be wrong. For anything important, use the Connect section.</p>
        </section>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        data-testid="ask-toggle-btn"
        className={`btn h-12 gap-2.5 border border-bone/15 bg-coal/85 px-5 text-bone shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl hover:border-gold/50 ${open ? "max-sm:hidden" : ""}`}
      >
        <Mark className="h-5 w-5 text-gold" />
        {open ? "Close" : "Ask IHBNF"}
      </button>
    </div>
  );
}
