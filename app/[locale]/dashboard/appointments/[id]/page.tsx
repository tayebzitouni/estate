import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, MapPin } from "lucide-react";

import { AppointmentActions } from "@/components/appointments/appointment-actions";
import { AppointmentFollowUpForm } from "@/components/appointments/appointment-follow-up-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function statusVariant(status: string) {
  if (status === "CONFIRMED" || status === "COMPLETED") return "accent";
  if (status === "CANCELLED") return "danger";
  return "warning";
}

export default async function AppointmentDetailsPage({
  params
}: {
  params: { locale: string; id: string };
}) {
  const session = getCurrentSession();
  if (!session) redirect(`/${params.locale}/login`);

  const appointment = await prisma.viewingAppointment.findUnique({
    where: { id: params.id },
    include: {
      listing: { include: { owner: { include: { profile: true } }, agent: { include: { profile: true } } } },
      requester: { include: { profile: true } },
      manager: { include: { profile: true } }
    }
  });

  if (!appointment) redirect(`/${params.locale}/dashboard/appointments`);

  const canView =
    session.role === "ADMIN" ||
    appointment.requesterId === session.userId ||
    appointment.listing.ownerId === session.userId ||
    appointment.listing.agentId === session.userId;
  if (!canView) redirect(`/${params.locale}/dashboard`);

  const canOwnerRespond =
    session.role === "ADMIN" ||
    appointment.listing.ownerId === session.userId ||
    appointment.listing.agentId === session.userId;
  const passedMoreThan24h = Date.now() - appointment.requestedAt.getTime() > 24 * 60 * 60 * 1000;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost">
        <Link href={`/${params.locale}/dashboard/appointments`}>Back to calendar</Link>
      </Button>

      <Card className="mt-6">
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-brand-emerald">
                <CalendarDays className="h-4 w-4" />
                Viewing meeting
              </div>
              <h1 className="mt-2 text-3xl font-semibold text-brand-navy">{appointment.listing.title}</h1>
              <div className="mt-2 flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                {appointment.listing.commune}, {appointment.listing.wilaya}
              </div>
            </div>
            <Badge variant={statusVariant(appointment.status)}>{appointment.status}</Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-brand-gray p-4">
              <div className="text-sm text-slate-500">Date and time</div>
              <div className="mt-1 font-semibold text-brand-navy">{appointment.requestedAt.toLocaleString()}</div>
            </div>
            <div className="rounded-3xl bg-brand-gray p-4">
              <div className="text-sm text-slate-500">Client</div>
              <Link href={`/${params.locale}/profiles/${appointment.requesterId}`} className="mt-1 block font-semibold text-brand-navy hover:underline">
                {appointment.requester.profile?.fullName ?? appointment.requester.email}
              </Link>
            </div>
            <div className="rounded-3xl bg-brand-gray p-4">
              <div className="text-sm text-slate-500">Owner / agent</div>
              <Link href={`/${params.locale}/profiles/${appointment.listing.agentId ?? appointment.listing.ownerId}`} className="mt-1 block font-semibold text-brand-navy hover:underline">
                {appointment.listing.agent?.profile?.fullName ?? appointment.listing.owner.profile?.fullName ?? appointment.listing.owner.email}
              </Link>
            </div>
          </div>

          {appointment.note ? (
            <div className="rounded-3xl border border-slate-200 p-4">
              <div className="font-semibold text-brand-navy">Client note</div>
              <p className="mt-2 text-slate-600">{appointment.note}</p>
            </div>
          ) : null}

          {appointment.status === "REQUESTED" && canOwnerRespond ? <AppointmentActions appointmentId={appointment.id} /> : null}

          {appointment.status === "CONFIRMED" || appointment.status === "COMPLETED" ? (
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
              <h2 className="text-xl font-semibold text-brand-navy">Meeting result</h2>
              {appointment.followUpAt ? (
                <div className="mt-4 rounded-3xl bg-white p-4">
                  <div className="font-semibold text-brand-navy">{appointment.meetingOutcome}</div>
                  <p className="mt-2 leading-7 text-slate-600">{appointment.meetingNotes}</p>
                  <div className="mt-2 text-xs text-slate-500">Saved {appointment.followUpAt.toLocaleString()}</div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  Add what happened after the visit. If this stays empty more than 24 hours after the meeting time, the system sends a reminder notification.
                </p>
              )}
              {!appointment.followUpAt || canOwnerRespond ? (
                <div className="mt-4">
                  <AppointmentFollowUpForm
                    appointmentId={appointment.id}
                    initialOutcome={appointment.meetingOutcome}
                    initialNotes={appointment.meetingNotes}
                  />
                </div>
              ) : null}
              {passedMoreThan24h && !appointment.followUpAt ? (
                <div className="mt-4 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-800">
                  This meeting is overdue for follow-up.
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
