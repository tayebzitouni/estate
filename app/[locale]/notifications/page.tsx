import { redirect } from "next/navigation";
import { BellRing } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  await prisma.notification.updateMany({
    where: { userId: session.userId, readAt: null },
    data: { readAt: new Date() }
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <BellRing className="h-6 w-6 text-brand-emerald" />
        <h1 className="text-3xl font-semibold text-brand-navy">Notifications</h1>
      </div>
      <div className="mt-6 grid gap-4">
        {notifications.map((notification) => (
          <Card key={notification.id}>
            <CardContent className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center">
              <div>
                <div className="font-semibold text-brand-navy">{notification.title}</div>
                <div className="mt-1 text-sm text-slate-600">{notification.body}</div>
                <div className="mt-2 text-xs text-slate-400">{notification.createdAt.toLocaleString()}</div>
              </div>
              <Badge variant={notification.readAt ? "default" : "warning"}>{notification.readAt ? "Read" : "New"}</Badge>
            </CardContent>
          </Card>
        ))}
        {notifications.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-panel">No notifications yet.</div>
        ) : null}
      </div>
    </div>
  );
}
