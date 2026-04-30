"use client";

import { FormEvent, useState } from "react";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ReviewForm({
  listingId,
  targetUserId,
  label = "Leave a review"
}: {
  listingId?: string;
  targetUserId?: string;
  label?: string;
}) {
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsLoading(true);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, targetUserId, rating, title, comment })
    });

    setNotice(response.ok ? "Review published successfully." : "Could not publish review. Please login and try again.");
    if (response.ok) {
      setTitle("");
      setComment("");
      setRating(5);
    }
    setIsLoading(false);
  }

  return (
    <form className="space-y-3 rounded-3xl bg-brand-gray p-4" onSubmit={submit}>
      <div className="font-semibold text-brand-navy">{label}</div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setRating(value)}
            className={value <= rating ? "text-amber-500" : "text-slate-300"}
            aria-label={`${value} stars`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
      <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Short title" />
      <Textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Share the real experience, behavior, payment seriousness, communication, or property quality." required />
      <Button type="submit" variant="accent" disabled={isLoading}>
        {isLoading ? "Publishing..." : "Publish review"}
      </Button>
      {notice ? <div className="text-sm text-slate-600">{notice}</div> : null}
    </form>
  );
}
