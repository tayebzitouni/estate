import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const body = await request.json();
  const message = await prisma.message.create({
    data: {
      conversationId: body.conversationId,
      senderId: session.userId,
      content: body.content
    }
  });
  return Response.json(message, { status: 201 });
}
