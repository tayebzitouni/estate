import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const tomorrowStart = new Date();
  tomorrowStart.setHours(0, 0, 0, 0);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);

  const upcoming = await prisma.viewingAppointment.findMany({
    where: {
      status: "CONFIRMED",
      requestedAt: { gte: tomorrowStart, lt: tomorrowEnd },
      OR: [
        { requesterId: session.userId },
        { listing: { OR: [{ ownerId: session.userId }, { agentId: session.userId }] } }
      ]
    },
    include: { listing: true }
  });

  for (const appointment of upcoming) {
    const existing = await prisma.notification.findFirst({
      where: {
        userId: session.userId,
        type: "APPOINTMENT_REMINDER",
        body: { contains: appointment.id }
      }
    });

    if (!existing) {
      await prisma.notification.create({
        data: {
          userId: session.userId,
          type: "APPOINTMENT_REMINDER",
          title: "Viewing reminder",
          body: `${appointment.listing.title} is scheduled tomorrow at ${appointment.requestedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}. Ref: ${appointment.id}`
        }
      });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return Response.json(notifications);
}
