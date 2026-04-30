"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ListingReviewActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function review(status: "APPROVED" | "REJECTED") {
    setIsLoading(true);
    await fetch("/api/admin/moderation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, status, notes })
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="grid gap-3 sm:min-w-80">
      <Input value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Review note" />
      <div className="flex gap-2">
        <Button className="flex-1" variant="accent" disabled={isLoading} onClick={() => review("APPROVED")}>
          <Check className="me-2 h-4 w-4" />
          Approve
        </Button>
        <Button className="flex-1" variant="outline" disabled={isLoading} onClick={() => review("REJECTED")}>
          <X className="me-2 h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}
