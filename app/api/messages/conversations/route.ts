import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participantAId: session.userId }, { participantBId: session.userId }]
    },
    include: {
      messages: { include: { sender: { include: { profile: true } } }, orderBy: { createdAt: "asc" } },
      listing: true,
      participantA: { include: { profile: true } },
      participantB: { include: { profile: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
  return Response.json(conversations);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const body = await request.json();
  const listing = body.listingId ? await prisma.listing.findUnique({ where: { id: body.listingId } }) : null;
  const participantBId = body.participantBId ?? listing?.ownerId;

  if (!participantBId || participantBId === session.userId) {
    return toApiError("A valid conversation recipient is required.");
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      listingId: body.listingId,
      OR: [
        { participantAId: session.userId, participantBId },
        { participantAId: participantBId, participantBId: session.userId }
      ]
    },
    include: { messages: true, listing: true }
  });

  if (existing) return Response.json(existing);

  const conversation = await prisma.conversation.create({
    data: {
      listingId: body.listingId,
      participantAId: session.userId,
      participantBId
    }
  });
  return Response.json(conversation, { status: 201 });
}
