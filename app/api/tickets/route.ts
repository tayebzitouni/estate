import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { ticketMessageSchema, ticketSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

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

  return Response.json(tickets);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Login required to create a ticket.", 401);

  const body = await request.json();
  const parsed = ticketSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", ") || "Invalid ticket.");

  const ticket = await prisma.supportTicket.create({
    data: {
      reporterId: session.userId,
      listingId: parsed.data.listingId,
      targetUserId: parsed.data.targetUserId,
      subject: parsed.data.subject,
      category: parsed.data.category,
      description: parsed.data.description,
      priority: parsed.data.priority,
      messages: {
        create: {
          senderId: session.userId,
          message: parsed.data.description
        }
      }
    }
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: "New support ticket",
        body: `${session.name} opened: ${parsed.data.subject}`,
        type: "ticket"
      }))
    });
  }

  return Response.json(ticket, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const body = await request.json();
  if (body.status) {
    if (session.role !== "ADMIN") return toApiError("Only admins can update ticket status.", 403);
    const ticket = await prisma.supportTicket.update({
      where: { id: body.ticketId },
      data: { status: body.status, assignedToId: session.userId }
    });
    return Response.json(ticket);
  }

  const parsed = ticketMessageSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", ") || "Invalid message.");

  const ticket = await prisma.supportTicket.findUnique({ where: { id: parsed.data.ticketId } });
  if (!ticket) return toApiError("Ticket not found.", 404);
  const canReply = session.role === "ADMIN" || ticket.reporterId === session.userId || ticket.targetUserId === session.userId;
  if (!canReply) return toApiError("Unauthorized", 403);

  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: parsed.data.ticketId,
      senderId: session.userId,
      message: parsed.data.message
    }
  });
  await prisma.supportTicket.update({ where: { id: ticket.id }, data: { updatedAt: new Date() } });

  return Response.json(message, { status: 201 });
}
