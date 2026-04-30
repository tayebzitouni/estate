"use client";

import { FormEvent, useState } from "react";
import { Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function ContactRequestForm({ listingId }: { listingId: string }) {
  const [isOpen, setIsOpen] = useState(false);
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
    <div className="space-y-3">
      <Button className="w-full justify-between border-emerald-100 bg-emerald-50 text-brand-navy hover:bg-emerald-100" variant="outline" type="button" onClick={() => setIsOpen((value) => !value)}>
        <span className="flex items-center gap-2">
          <Send className="h-4 w-4 text-brand-emerald" />
          Contact request
        </span>
        {isOpen ? <X className="h-4 w-4 text-slate-400" /> : null}
      </Button>
      {isOpen ? (
        <form className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm" onSubmit={submit}>
          <Textarea className="min-h-28 border-emerald-100 bg-emerald-50/40" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Ask about availability, documents, or visit timing." required />
          <Button className="w-full" variant="accent" disabled={isLoading} type="submit">
            {isLoading ? "Sending..." : "Send request"}
          </Button>
        </form>
      ) : null}
      {notice ? <div className="text-sm text-slate-500">{notice}</div> : null}
    </div>
  );
}
