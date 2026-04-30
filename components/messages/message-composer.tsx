"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MessageComposer({
  conversationId,
  listingId,
  participantBId
}: {
  conversationId?: string;
  listingId?: string;
  participantBId?: string;
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsLoading(true);

    let targetConversationId = conversationId;
    if (!targetConversationId && (listingId || participantBId)) {
      const conversationResponse = await fetch("/api/messages/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, participantBId })
      });
      const conversation = await conversationResponse.json();
      targetConversationId = conversation.id;
    }

    if (targetConversationId) {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: targetConversationId, content })
      });
    }

    setContent("");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form className="flex items-end gap-3 border-t border-slate-200 bg-white p-4" onSubmit={handleSubmit}>
      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Write a message..."
        className="max-h-36 min-h-12 flex-1 resize-none rounded-2xl border border-border bg-brand-gray px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <Button className="h-12 w-12 shrink-0 rounded-full p-0" variant="accent" disabled={isLoading} type="submit" aria-label="Send message">
        <Send className="h-5 w-5" />
      </Button>
    </form>
  );
}
