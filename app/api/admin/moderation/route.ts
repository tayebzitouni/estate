import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") return toApiError("Forbidden", 403);
  const [pendingListings, pendingVerifications, reports] = await Promise.all([
    prisma.listing.findMany({
      where: { verificationStatus: "PENDING" },
      include: { owner: { include: { profile: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.verificationProfile.findMany({ where: { status: "PENDING" }, include: { user: { include: { profile: true } } } }),
    prisma.report.findMany({ where: { status: "OPEN" }, include: { listing: true } })
  ]);
  return Response.json({ pendingListings, pendingVerifications, reports });
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session || session.role !== "ADMIN") return toApiError("Forbidden", 403);
  const body = await request.json();
  if (!body.listingId || !["APPROVED", "REJECTED"].includes(body.status)) {
    return toApiError("Listing id and APPROVED or REJECTED status are required.");
  }

  const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
  if (!listing) return toApiError("Listing not found", 404);

  const nextStatus = body.status === "APPROVED" ? "PUBLISHED" : "DRAFT";

  const moderationCase = await prisma.moderationCase.create({
    data: {
      listingId: body.listingId,
      notes: body.notes,
      moderatorId: session.userId,
      status: body.status ?? "PENDING"
    }
  });

  const [updatedListing] = await Promise.all([
    prisma.listing.update({
      where: { id: body.listingId },
      data: {
        verificationStatus: body.status,
        status: nextStatus,
        approvedAt: body.status === "APPROVED" ? new Date() : null,
        approvedById: body.status === "APPROVED" ? session.userId : null,
        rejectionReason: body.status === "REJECTED" ? body.notes ?? "Rejected by admin." : null
      }
    }),
    prisma.notification.create({
      data: {
        userId: listing.ownerId,
        type: "LISTING_REVIEW",
        title: body.status === "APPROVED" ? "Listing approved" : "Listing rejected",
        body:
          body.status === "APPROVED"
            ? `${listing.title} is now visible to clients.`
            : `${listing.title} was rejected. ${body.notes ?? "Please review the details and submit again."}`
      }
    })
  ]);

  return Response.json({ moderationCase, listing: updatedListing }, { status: 201 });
}
