import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);
  if (session.role !== "ADMIN") redirect(`/${params.locale}/dashboard`);

  const [reports, tickets] = await Promise.all([
    prisma.report.findMany({
      include: { listing: true, reporter: { include: { profile: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.supportTicket.findMany({
      include: {
        reporter: { include: { profile: true } },
        targetUser: { include: { profile: true } }
      },
      orderBy: { updatedAt: "desc" }
    })
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-navy">Admin fraud, reports, and tickets</h1>
      <div className="mt-6 grid gap-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <div className="text-lg font-semibold text-brand-navy">{report.listing.title}</div>
                <div className="mt-1 text-sm text-slate-500">{report.reason}</div>
                <div className="mt-1 text-xs text-slate-400">
                  Reporter: {report.reporter?.profile?.fullName ?? report.reporter?.email ?? "Guest"}
                </div>
              </div>
              <Badge variant={report.status === "OPEN" ? "warning" : report.status === "RESOLVED" ? "accent" : "default"}>{report.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div>
                <div className="text-lg font-semibold text-brand-navy">{ticket.subject}</div>
                <div className="mt-1 text-sm text-slate-500">{ticket.description}</div>
                <div className="mt-1 text-xs text-slate-400">
                  From {ticket.reporter.profile?.fullName ?? ticket.reporter.email}
                  {ticket.targetUser ? ` about ${ticket.targetUser.profile?.fullName ?? ticket.targetUser.email}` : ""}
                </div>
              </div>
              <Badge variant={ticket.status === "OPEN" ? "warning" : ticket.status === "RESOLVED" ? "accent" : "default"}>{ticket.status}</Badge>
            </CardContent>
          </Card>
        ))}
        {!reports.length && !tickets.length ? (
          <Card>
            <CardContent className="p-6 text-sm text-slate-500">No reports or support tickets yet.</CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
