import Link from "next/link";
import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
  searchParams
}: {
  params: { locale: string };
  searchParams: { verify?: string };
}) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      ownedListings: { orderBy: { createdAt: "desc" } },
      agentListings: { orderBy: { createdAt: "desc" } },
      savedListings: { include: { listing: true } },
      leads: { include: { listing: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!user) redirect(`/${params.locale}/login`);

  const verifyMessage =
    searchParams.verify === "success"
      ? "Email verified successfully."
      : searchParams.verify === "expired"
        ? "Verification link expired."
        : searchParams.verify === "invalid"
          ? "Invalid verification token."
          : searchParams.verify === "taken"
            ? "That email is already in use."
            : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brand-navy">Account settings</h1>
          <p className="mt-2 text-slate-500">Manage your profile, email verification, and account activity.</p>
        </div>
        <Badge variant={user.emailVerifiedAt ? "accent" : "warning"}>
          {user.emailVerifiedAt ? "Email verified" : "Email not verified"}
        </Badge>
      </div>

      {verifyMessage ? <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-panel">{verifyMessage}</div> : null}
      {!user.emailVerifiedAt ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-700">Please verify your email address.</div>
      ) : null}
      {user.pendingEmail ? (
        <div className="mt-6 rounded-2xl bg-brand-gray p-4 text-sm text-slate-700">
          Pending email change: {user.pendingEmail}. Please verify your new email address.
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 text-sm text-slate-500">Role: {user.role}</div>
            <ProfileForm user={user} />
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {(user.role === "OWNER" || user.role === "AGENT" || user.role === "PROPERTY_MANAGER") ? (
            <Card>
              <CardHeader>
                <CardTitle>My apartments</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {[...user.ownedListings, ...user.agentListings].map((listing) => (
                  <div key={listing.id} className="rounded-2xl bg-brand-gray p-4 text-sm">
                    <div className="font-medium text-brand-navy">{listing.title}</div>
                    <div className="mt-1 text-slate-600">
                      {listing.status} / {listing.verificationStatus}
                    </div>
                    {listing.rejectionReason ? <div className="mt-1 text-rose-700">{listing.rejectionReason}</div> : null}
                  </div>
                ))}
                {user.ownedListings.length + user.agentListings.length === 0 ? (
                  <div className="text-sm text-slate-500">No apartments submitted yet.</div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Saved apartments</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {user.savedListings.map((item) => (
                <Link key={item.id} className="rounded-2xl bg-brand-gray p-4 text-sm text-brand-navy" href={`/${params.locale}/listing/${item.listing.slug}`}>
                  {item.listing.title}
                </Link>
              ))}
              {user.savedListings.length === 0 ? <div className="text-sm text-slate-500">No saved apartments yet.</div> : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact requests</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {user.leads.map((lead) => (
                <div key={lead.id} className="rounded-2xl bg-brand-gray p-4 text-sm">
                  <div className="font-medium text-brand-navy">{lead.listing.title}</div>
                  <div className="mt-1 text-slate-600">{lead.status}</div>
                </div>
              ))}
              {user.leads.length === 0 ? <div className="text-sm text-slate-500">No contact requests yet.</div> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
