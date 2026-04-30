"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StartMessageButton({
  listingId,
  participantBId,
  locale,
  className
}: {
  listingId?: string;
  participantBId?: string;
  locale: string;
  className?: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function startConversation() {
    setIsLoading(true);
    const response = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, participantBId })
    });

    if (response.ok) {
      const conversation = await response.json();
      router.push(`/${locale}/messages?conversationId=${conversation.id}`);
      router.refresh();
      return;
    }

    router.push(`/${locale}/login`);
  }

  return (
    <Button type="button" className={className} variant="outline" disabled={isLoading} onClick={startConversation}>
      <span className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        {isLoading ? "Opening chat..." : "Message"}
      </span>
    </Button>
  );
}
