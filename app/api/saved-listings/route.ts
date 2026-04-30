import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const items = await prisma.savedListing.findMany({ where: { userId: session.userId }, include: { listing: true } });
  return Response.json(items);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const { listingId } = await request.json();
  if (!listingId) return toApiError("listingId is required");
  const listing = await prisma.listing.findFirst({
    where: { id: listingId, status: "PUBLISHED", verificationStatus: "APPROVED" }
  });
  if (!listing) return toApiError("Listing not found", 404);
  const saved = await prisma.savedListing.upsert({
    where: { userId_listingId: { userId: session.userId, listingId } },
    update: {},
    create: { userId: session.userId, listingId }
  });
  return Response.json(saved, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const { listingId } = await request.json();
  if (!listingId) return toApiError("listingId is required");

  await prisma.savedListing.deleteMany({ where: { userId: session.userId, listingId } });
  return Response.json({ ok: true });
}
