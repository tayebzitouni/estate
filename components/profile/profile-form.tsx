"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ProfileFormProps = {
  user: {
    email: string;
    profile?: {
      fullName: string;
      phone?: string | null;
      city?: string | null;
      bio?: string | null;
    } | null;
  };
};

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        city: String(form.get("city") ?? ""),
        bio: String(form.get("bio") ?? "")
      })
    });
    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Unable to update profile.");
    } else {
      setMessage(payload.message ?? "Profile updated successfully.");
      router.refresh();
    }

    setIsLoading(false);
  }

  return (
    <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
      <div className="md:col-span-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" defaultValue={user.profile?.fullName ?? ""} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.profile?.phone ?? ""} />
      </div>
      <div>
        <Label htmlFor="city">City</Label>
        <Input id="city" name="city" defaultValue={user.profile?.city ?? ""} />
      </div>
      <div className="md:col-span-2">
        <Label htmlFor="bio">Profile information</Label>
        <Textarea id="bio" name="bio" defaultValue={user.profile?.bio ?? ""} />
      </div>
      {message ? <div className="md:col-span-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div> : null}
      {error ? <div className="md:col-span-2 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <Button className="md:col-span-2" variant="accent" disabled={isLoading} type="submit">
        {isLoading ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
