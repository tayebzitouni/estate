import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { appointmentSchema } from "@/lib/validations";

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
  if (!body.id || !["CONFIRMED", "CANCELLED"].includes(body.status)) {
    return toApiError("Appointment id and CONFIRMED or CANCELLED status are required.");
  }

  const appointment = await prisma.viewingAppointment.findUnique({
    where: { id: body.id },
    include: { listing: true, requester: true }
  });
  if (!appointment) return toApiError("Appointment not found", 404);
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
