import { redirect } from "next/navigation";
import { LifeBuoy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TicketForm } from "@/components/tickets/ticket-form";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SupportPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const tickets = await prisma.supportTicket.findMany({
    where:
      session.role === "ADMIN"
        ? {}
        : {
            OR: [{ reporterId: session.userId }, { targetUserId: session.userId }]
          },
    include: {
      reporter: { include: { profile: true } },
      targetUser: { include: { profile: true } },
      messages: { include: { sender: { include: { profile: true } } }, orderBy: { createdAt: "asc" } }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-brand-emerald">
            <LifeBuoy className="h-4 w-4" />
            Support center
          </div>
          <h1 className="mt-2 text-3xl font-semibold text-brand-navy">Complaints and tickets</h1>
          <p className="mt-2 text-slate-500">Clients and proprietors can report problems. Admin can see every ticket.</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-brand-navy">Create a new ticket</h2>
            <TicketForm />
          </CardContent>
        </Card>

        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardContent className="space-y-4 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-brand-navy">{ticket.subject}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      By {ticket.reporter.profile?.fullName ?? ticket.reporter.email}
                      {ticket.targetUser ? ` about ${ticket.targetUser.profile?.fullName ?? ticket.targetUser.email}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge>{ticket.category}</Badge>
                    <Badge variant={ticket.status === "OPEN" ? "warning" : ticket.status === "RESOLVED" ? "accent" : "default"}>{ticket.status}</Badge>
                  </div>
                </div>
                <p className="leading-7 text-slate-600">{ticket.description}</p>
                <div className="rounded-3xl bg-brand-gray p-4">
                  <div className="mb-2 text-sm font-semibold text-brand-navy">Conversation</div>
                  {ticket.messages.map((message) => (
                    <div key={message.id} className="border-b border-white/70 py-2 text-sm last:border-0">
                      <span className="font-semibold text-brand-navy">{message.sender.profile?.fullName ?? message.sender.email}: </span>
                      <span className="text-slate-600">{message.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {!tickets.length ? (
            <Card>
              <CardContent className="p-6 text-sm text-slate-500">No tickets yet.</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
