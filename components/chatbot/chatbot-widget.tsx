"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatLine = {
  role: "user" | "bot";
  text: string;
};

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [lines, setLines] = useState<ChatLine[]>([
    { role: "bot", text: "Hi, I am Darak assistant. Ask me about verification, listings, reviews, tickets, visits, or messages." }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;
    const current = question.trim();
    setQuestion("");
    setLines((value) => [...value, { role: "user", text: current }]);
    setIsLoading(true);

    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: current })
    });
    const data = await response.json();
    setLines((value) => [...value, { role: "bot", text: data.answer }]);
    setIsLoading(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {isOpen ? (
        <div className="mb-3 w-[min(92vw,380px)] overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-brand-navy px-5 py-4 text-white">
            <div className="flex items-center gap-2 font-semibold">
              <Bot className="h-5 w-5 text-brand-emerald" />
              Darak assistant
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close chatbot">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {lines.map((line, index) => (
              <div
                key={`${line.role}-${index}`}
                className={`rounded-3xl px-4 py-3 text-sm ${
                  line.role === "user" ? "ms-auto max-w-[82%] bg-brand-emerald text-white" : "me-auto max-w-[88%] bg-white text-slate-700 shadow-sm"
                }`}
              >
                {line.text}
              </div>
            ))}
            {isLoading ? <div className="text-xs text-slate-500">Assistant is typing...</div> : null}
          </div>
          <form className="flex gap-2 border-t p-3" onSubmit={submit}>
            <Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." />
            <Button type="submit" size="sm" variant="accent" aria-label="Send question">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}
      <Button type="button" variant="accent" className="h-14 w-14 rounded-full shadow-2xl" onClick={() => setIsOpen((value) => !value)} aria-label="Open chatbot">
        <Bot className="h-6 w-6" />
      </Button>
    </div>
  );
}
