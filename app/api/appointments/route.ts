import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { appointmentFollowUpSchema, appointmentSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const where =
    session.role === "ADMIN"
      ? {}
      : session.role === "OWNER" || session.role === "AGENT" || session.role === "PROPERTY_MANAGER"
        ? { listing: { OR: [{ ownerId: session.userId }, { agentId: session.userId }] } }
        : { requesterId: session.userId };

  const appointments = await prisma.viewingAppointment.findMany({
    where,
    include: { listing: true, requester: { include: { profile: true } } },
    orderBy: { requestedAt: "asc" }
  });
  return Response.json(appointments);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const body = await request.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));
  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return toApiError("Listing not found", 404);

  const appointment = await prisma.viewingAppointment.create({
    data: {
      listingId: parsed.data.listingId,
      requesterId: session.userId,
      managerId: listing.ownerId,
      requestedAt: new Date(parsed.data.requestedAt),
      note: parsed.data.note
    }
  });
  await prisma.notification.create({
    data: {
      userId: listing.ownerId,
      type: "APPOINTMENT_REQUEST",
      title: "New viewing request",
      body: `${session.name} requested a viewing for ${listing.title}.`
    }
  });
  return Response.json(appointment, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const body = await request.json();
  if (!body.id) {
    return toApiError("Appointment id is required.");
  }

  const appointment = await prisma.viewingAppointment.findUnique({
    where: { id: body.id },
    include: { listing: true, requester: true }
  });
  if (!appointment) return toApiError("Appointment not found", 404);
  const canManage =
    session.role === "ADMIN" ||
    appointment.requesterId === session.userId ||
    appointment.listing.ownerId === session.userId ||
    appointment.listing.agentId === session.userId;

  if (!canManage) return toApiError("Forbidden", 403);

  if (body.meetingOutcome || body.meetingNotes) {
    if (appointment.status !== "CONFIRMED" && appointment.status !== "COMPLETED") {
      return toApiError("Only confirmed meetings can receive details.");
    }
    const parsed = appointmentFollowUpSchema.safeParse(body);
    if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", ") || "Invalid meeting details.");

    const updated = await prisma.viewingAppointment.update({
      where: { id: parsed.data.id },
      data: {
        status: "COMPLETED",
        meetingOutcome: parsed.data.meetingOutcome,
        meetingNotes: parsed.data.meetingNotes,
        followUpAt: new Date()
      },
      include: { listing: true }
    });

    const recipients = Array.from(new Set([appointment.requesterId, appointment.listing.ownerId].filter(Boolean)));
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: "APPOINTMENT_FOLLOW_UP",
        title: "Meeting details saved",
        body: `Meeting details were saved for ${appointment.listing.title}. Ref: ${appointment.id}`
      }))
    });

    return Response.json(updated);
  }

  if (!["CONFIRMED", "CANCELLED"].includes(body.status)) {
    return toApiError("CONFIRMED or CANCELLED status is required.");
  }

  if (
    session.role !== "ADMIN" &&
    appointment.listing.ownerId !== session.userId &&
    appointment.listing.agentId !== session.userId
  ) {
    return toApiError("Forbidden", 403);
  }

  const updated = await prisma.viewingAppointment.update({
    where: { id: body.id },
    data: { status: body.status },
    include: { listing: true }
  });

  const title = body.status === "CONFIRMED" ? "Viewing confirmed" : "Viewing rejected";
  const clientBody =
    body.status === "CONFIRMED"
      ? `Your viewing for ${appointment.listing.title} was confirmed and added to your calendar.`
      : `Your viewing for ${appointment.listing.title} was rejected.`;
  const ownerBody =
    body.status === "CONFIRMED"
      ? `You accepted the viewing for ${appointment.listing.title}. It is now on your calendar.`
      : `You rejected the viewing for ${appointment.listing.title}.`;

  await prisma.notification.createMany({
    data: [
      {
        userId: appointment.requesterId,
        type: "APPOINTMENT_STATUS",
        title,
        body: clientBody
      },
      {
        userId: appointment.listing.ownerId,
        type: "APPOINTMENT_STATUS",
        title,
        body: ownerBody
      }
    ]
  });

  return Response.json(updated);
}
