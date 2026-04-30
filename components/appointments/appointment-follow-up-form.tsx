"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AppointmentFollowUpForm({
  appointmentId,
  initialOutcome = "",
  initialNotes = ""
}: {
  appointmentId: string;
  initialOutcome?: string | null;
  initialNotes?: string | null;
}) {
  const router = useRouter();
  const [meetingOutcome, setMeetingOutcome] = useState(initialOutcome ?? "");
  const [meetingNotes, setMeetingNotes] = useState(initialNotes ?? "");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setIsLoading(true);

    const response = await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appointmentId, meetingOutcome, meetingNotes })
    });

    setNotice(response.ok ? "Meeting details saved." : "Could not save meeting details.");
    setIsLoading(false);
    router.refresh();
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Input value={meetingOutcome} onChange={(event) => setMeetingOutcome(event.target.value)} placeholder="Example: visited, client absent, owner absent, needs follow-up" required />
      <Textarea value={meetingNotes} onChange={(event) => setMeetingNotes(event.target.value)} placeholder="Write what happened in the meeting." required />
      <Button type="submit" variant="accent" disabled={isLoading}>
        <ClipboardCheck className="me-2 h-4 w-4" />
        {isLoading ? "Saving..." : "Save meeting details"}
      </Button>
      {notice ? <div className="text-sm text-slate-600">{notice}</div> : null}
    </form>
  );
}
