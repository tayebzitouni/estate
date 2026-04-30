"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AppointmentActions({ appointmentId }: { appointmentId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function update(status: "CONFIRMED" | "CANCELLED") {
    setIsLoading(true);
    await fetch("/api/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: appointmentId, status })
    });
    setIsLoading(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <Button variant="accent" disabled={isLoading} onClick={() => update("CONFIRMED")}>
        <Check className="me-2 h-4 w-4" />
        Accept
      </Button>
      <Button variant="outline" disabled={isLoading} onClick={() => update("CANCELLED")}>
        <X className="me-2 h-4 w-4" />
        Reject
      </Button>
    </div>
  );
}
