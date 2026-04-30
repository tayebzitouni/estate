import { redirect } from "next/navigation";
import Link from "next/link";
import { CalendarDays, Clock3 } from "lucide-react";

import { AppointmentActions } from "@/components/appointments/appointment-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "CONFIRMED") return "accent";
  if (status === "CANCELLED") return "danger";
  return "warning";
}

export default async function AppointmentsPage({ params }: { params: { locale: string } }) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const appointments = await prisma.viewingAppointment.findMany({
    where:
      session.role === "ADMIN"
        ? {}
        : session.role === "TENANT"
          ? { requesterId: session.userId }
          : { listing: { OR: [{ ownerId: session.userId }, { agentId: session.userId }] } },
    include: { listing: true, requester: { include: { profile: true } } },
    orderBy: { requestedAt: "asc" }
  });

  const confirmed = appointments.filter((appointment) => appointment.status === "CONFIRMED");
  const requested = appointments.filter((appointment) => appointment.status === "REQUESTED");
  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-7 w-7 text-brand-emerald" />
        <div>
          <h1 className="text-3xl font-semibold text-brand-navy">Viewing calendar</h1>
          <p className="mt-1 text-sm text-slate-500">Requests, accepted appointments, and reminders for this account only.</p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-7">
              {days.map((day) => {
                const dayAppointments = confirmed.filter((appointment) => {
                  const value = new Date(appointment.requestedAt);
                  return value.toDateString() === day.toDateString();
                });

                return (
                  <div key={day.toISOString()} className="min-h-32 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <div className="text-xs font-semibold uppercase text-slate-400">
                      {day.toLocaleDateString([], { weekday: "short" })}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-brand-navy">{day.getDate()}</div>
                    <div className="mt-3 grid gap-2">
                      {dayAppointments.map((appointment) => (
                        <Link key={appointment.id} href={`/${params.locale}/dashboard/appointments/${appointment.id}`} className="block rounded-xl bg-white p-2 text-xs text-slate-600 shadow-sm hover:bg-emerald-50">
                          <div className="font-medium text-brand-navy">{appointment.listing.title}</div>
                          <div>{new Date(appointment.requestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Clock3 className="h-5 w-5 text-brand-emerald" />
                <h2 className="text-xl font-semibold text-brand-navy">Pending requests</h2>
              </div>
              {requested.map((appointment) => (
                <div key={appointment.id} className="rounded-2xl bg-brand-gray p-4">
                  <div className="font-semibold text-brand-navy">{appointment.listing.title}</div>
                  <div className="mt-1 text-sm text-slate-600">
                    {appointment.requester.profile?.fullName ?? appointment.requester.email}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">{appointment.requestedAt.toLocaleString()}</div>
                  {session.role !== "TENANT" ? <div className="mt-3"><AppointmentActions appointmentId={appointment.id} /></div> : null}
                </div>
              ))}
              {requested.length === 0 ? <div className="text-sm text-slate-500">No pending requests.</div> : null}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <h2 className="text-xl font-semibold text-brand-navy">All appointments</h2>
              {appointments.map((appointment) => (
                <Link key={appointment.id} href={`/${params.locale}/dashboard/appointments/${appointment.id}`} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4 hover:bg-slate-50">
                  <div>
                    <div className="font-medium text-brand-navy">{appointment.listing.title}</div>
                    <div className="text-sm text-slate-500">{appointment.requestedAt.toLocaleString()}</div>
                    {appointment.status === "CONFIRMED" && !appointment.followUpAt ? (
                      <div className="mt-1 text-xs text-amber-600">Click after the visit to add meeting details.</div>
                    ) : null}
                  </div>
                  <Badge variant={statusVariant(appointment.status)}>{appointment.status}</Badge>
                </Link>
              ))}
              {appointments.length === 0 ? <div className="text-sm text-slate-500">No appointments yet.</div> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
