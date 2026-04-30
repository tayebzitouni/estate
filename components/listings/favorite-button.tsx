"use client";

import { useState } from "react";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";

export function FavoriteButton({ listingId }: { listingId: string }) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function save() {
    setIsLoading(true);
    setMessage("");
    const response = await fetch("/api/saved-listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId })
    });
    setMessage(response.ok ? "Favorite added." : "Login required to save.");
    setIsLoading(false);
  }

  return (
    <div className="space-y-2">
      <Button className="w-full justify-between border-slate-200 bg-white text-brand-navy hover:bg-slate-50" variant="outline" disabled={isLoading} onClick={save}>
        <span className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-rose-500" />
          Save apartment
        </span>
        <span className="text-xs text-slate-400">{isLoading ? "..." : "Later"}</span>
      </Button>
      {message ? <div className="text-sm text-slate-500">{message}</div> : null}
    </div>
  );
}
