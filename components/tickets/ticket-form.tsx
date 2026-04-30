"use client";

import { FormEvent, useState } from "react";
import { LifeBuoy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TicketForm({ listingId, targetUserId }: { listingId?: string; targetUserId?: string }) {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Complaint");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsLoading(true);

    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, targetUserId, subject, category, description, priority: "NORMAL" })
    });

    setNotice(response.ok ? "Ticket sent to admin support." : "Could not create ticket. Please login and try again.");
    if (response.ok) {
      setSubject("");
      setDescription("");
    }
    setIsLoading(false);
  }

  return (
    <form className="space-y-3" onSubmit={submit}>
      <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ticket subject" required />
      <Input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" required />
      <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Explain the problem for the admin team." required />
      <Button type="submit" variant="outline" disabled={isLoading}>
        <LifeBuoy className="me-2 h-4 w-4" />
        {isLoading ? "Sending..." : "Send complaint ticket"}
      </Button>
      {notice ? <div className="text-sm text-slate-600">{notice}</div> : null}
    </form>
  );
}
