"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function logout() {
    setIsLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/ar/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" disabled={isLoading} onClick={logout}>
      <LogOut className="me-2 h-4 w-4" />
      Logout
    </Button>
  );
}
