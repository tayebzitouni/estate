"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BookingForm({ listingId, locale }: { listingId: string; locale: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const requestedAt = String(form.get("requestedAt") ?? "");
    const note = String(form.get("note") ?? "");

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, requestedAt: new Date(requestedAt).toISOString(), note })
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Unable to request this viewing.");
        return;
      }

      router.push(`/${locale}/saved-properties`);
      router.refresh();
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="requestedAt">Preferred date and time</Label>
        <Input id="requestedAt" name="requestedAt" type="datetime-local" required />
      </div>
      <div>
        <Label htmlFor="note">Notes</Label>
        <Textarea id="note" name="note" placeholder="Access notes, availability, or special requests." />
      </div>
      {error ? <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button variant="accent" disabled={isLoading} type="submit">
        <CalendarPlus className="me-2 h-4 w-4" />
        {isLoading ? "Requesting..." : "Request appointment"}
      </Button>
    </form>
  );
}
