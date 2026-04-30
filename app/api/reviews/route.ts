import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const listingId = searchParams.get("listingId") ?? undefined;
  const targetUserId = searchParams.get("targetUserId") ?? undefined;

  if (!listingId && !targetUserId) {
    return toApiError("A listing or user target is required.");
  }

  const reviews = await prisma.review.findMany({
    where: {
      isPublic: true,
      ...(listingId ? { listingId } : {}),
      ...(targetUserId ? { targetUserId } : {})
    },
    include: {
      reviewer: { include: { profile: true } },
      listing: { select: { id: true, title: true, slug: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  return Response.json(reviews);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Login required to write a review.", 401);

  const body = await request.json();
  const parsed = reviewSchema.safeParse({
    ...body,
    rating: Number(body.rating)
  });
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", ") || "Invalid review.");

  const listing = parsed.data.listingId
    ? await prisma.listing.findUnique({ where: { id: parsed.data.listingId } })
    : null;

  const targetUserId = parsed.data.targetUserId ?? listing?.ownerId;
  if (targetUserId === session.userId) {
    return toApiError("You cannot review yourself.");
  }

  const review = await prisma.review.create({
    data: {
      reviewerId: session.userId,
      listingId: parsed.data.listingId,
      targetUserId,
      targetType: parsed.data.listingId ? "LISTING" : "USER",
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      comment: parsed.data.comment
    }
  });

  if (targetUserId) {
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: "New review received",
        body: `${session.name} left a ${parsed.data.rating}/5 review.`,
        type: "review"
      }
    });
  }

  return Response.json(review, { status: 201 });
}
