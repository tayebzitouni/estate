import Link from "next/link";
import { CalendarRange, LayoutGrid, MessagesSquare, Plus, Users } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  const stats = await getDashboardSnapshot(session);
  const notifications = session
    ? await prisma.notification.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-brand-navy">Owner and agent dashboard</h1>
          <p className="mt-2 text-slate-500">Manage listings, leads, appointments, and trust signals in one place.</p>
        </div>
        <Button asChild variant="accent">
          <Link href={`/${params.locale}/dashboard/listings/new`}>
            <Plus className="me-2 h-4 w-4" />
            Add property
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <StatCard icon={LayoutGrid} label="Active listings" value={stats.listingCount} />
        <StatCard icon={CalendarRange} label="Pending appointments" value={stats.pendingAppointments} />
        <StatCard icon={Users} label="Open leads" value={stats.activeLeads} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-xl font-semibold text-brand-navy">Operational shortcuts</h2>
            <div className="grid gap-3">
              <Button variant="outline" asChild><Link href={`/${params.locale}/dashboard/leads`}>Open leads dashboard</Link></Button>
              <Button variant="outline" asChild><Link href={`/${params.locale}/dashboard/appointments`}>Manage viewings</Link></Button>
              <Button variant="outline" asChild><Link href={`/${params.locale}/messages`}>Open messages</Link></Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center gap-3">
              <MessagesSquare className="h-5 w-5 text-brand-emerald" />
              <h2 className="text-xl font-semibold text-brand-navy">Notifications</h2>
            </div>
            {notifications.length > 0 ? (
              <div className="grid gap-3 text-sm text-slate-600">
                {notifications.map((notification) => (
                  <div key={notification.id} className="rounded-2xl bg-brand-gray p-4">
                    <div className="font-medium text-brand-navy">{notification.title}</div>
                    <div className="mt-1">{notification.body}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-brand-gray p-4 text-sm text-slate-600">No notifications yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
