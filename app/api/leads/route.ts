import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const where =
    session.role === "ADMIN"
      ? {}
      : session.role === "OWNER" || session.role === "AGENT" || session.role === "PROPERTY_MANAGER"
        ? { listing: { OR: [{ ownerId: session.userId }, { agentId: session.userId }] } }
        : { userId: session.userId };

  const leads = await prisma.lead.findMany({ where, include: { listing: true }, orderBy: { createdAt: "desc" } });
  return Response.json(leads);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const body = await request.json();
  if (!body.listingId || !body.message) return toApiError("Listing and message are required.");
  const listing = await prisma.listing.findFirst({
    where: { id: body.listingId, status: "PUBLISHED", verificationStatus: "APPROVED" }
  });
  if (!listing) return toApiError("Listing not found", 404);

  const lead = await prisma.lead.create({
    data: {
      listingId: body.listingId,
      userId: session.userId,
      name: body.name ?? session.name,
      email: body.email ?? session.email,
      phone: body.phone,
      message: body.message
    }
  });
  await prisma.notification.create({
    data: {
      userId: listing.ownerId,
      type: "CONTACT_REQUEST",
      title: "New contact request",
      body: `${session.name} contacted you about ${listing.title}.`
    }
  });
  return Response.json(lead, { status: 201 });
}
