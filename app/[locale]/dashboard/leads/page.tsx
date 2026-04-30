import Link from "next/link";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function LeadsPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const where =
    session.role === "ADMIN"
      ? {}
      : session.role === "TENANT"
        ? { userId: session.userId }
        : {
            listing: {
              OR: [{ ownerId: session.userId }, { agentId: session.userId }]
            }
          };

  const leads = await prisma.lead.findMany({
    where,
    include: { listing: true, user: { include: { profile: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-navy">Contact requests</h1>
      <div className="mt-6 grid gap-4">
        {leads.map((lead) => (
          <Card key={lead.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-6 md:flex-row md:items-center">
              <div>
                <div className="text-lg font-semibold text-brand-navy">{lead.user?.profile?.fullName ?? lead.name}</div>
                <div className="mt-1 text-sm text-slate-500">{lead.listing.title}</div>
                <div className="mt-1 text-sm text-slate-500">{lead.message}</div>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-500 md:items-end">
                <div>{lead.status} - {lead.createdAt.toLocaleDateString()}</div>
                {lead.userId ? (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/${params.locale}/profiles/${lead.userId}`}>Check client profile</Link>
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        ))}
        {leads.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-panel">No contact requests for this account yet.</div>
        ) : null}
      </div>
    </div>
  );
}
