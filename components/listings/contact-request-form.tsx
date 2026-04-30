"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ContactRequestForm({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsLoading(true);
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, message })
    });

    setNotice(response.ok ? "Contact request sent." : "Login required to contact the proprietor.");
    if (response.ok) setMessage("");
    setIsLoading(false);
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about availability, documents, or visit timing." required />
      <Button className="w-full" variant="accent" disabled={isLoading} type="submit">
        <Send className="me-2 h-4 w-4" />
        Contact proprietor
      </Button>
      {notice ? <div className="text-sm text-slate-500">{notice}</div> : null}
    </form>
  );
}
