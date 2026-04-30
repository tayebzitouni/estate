import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { listingSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const listings = await prisma.listing.findMany({
    where: {
      status: "PUBLISHED",
      verificationStatus: "APPROVED"
    },
    include: {
      media: true,
      amenities: true,
      owner: { include: { profile: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  return Response.json(listings);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  if (!["OWNER", "AGENT", "PROPERTY_MANAGER", "ADMIN"].includes(session.role)) {
    return toApiError("Only proprietors can submit apartments.", 403);
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user?.emailVerifiedAt) {
    return toApiError("Please verify your email address before submitting an apartment.", 403);
  }

  const body = await request.json();
  const parsed = listingSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten();
    const messages = [
      ...errors.formErrors,
      ...Object.entries(errors.fieldErrors).flatMap(([field, fieldErrors]) =>
        (fieldErrors ?? []).map((message) => `${field}: ${message}`)
      )
    ];
    return toApiError(messages.join(", ") || "Please check the listing form.");
  }

  const property = await prisma.property.create({
    data: {
      ownerId: session.userId,
      title: parsed.data.title,
      propertyType: parsed.data.propertyType,
      wilaya: parsed.data.wilaya,
      commune: parsed.data.commune,
      neighborhood: parsed.data.neighborhood,
      addressHint: parsed.data.addressHint,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude
    }
  });

  const baseSlug = slugify(parsed.data.title);
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const listing = await prisma.listing.create({
    data: {
      propertyId: property.id,
      ownerId: session.userId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      priceDzd: parsed.data.priceDzd,
      transactionType: parsed.data.transactionType,
      propertyType: parsed.data.propertyType,
      wilaya: parsed.data.wilaya,
      commune: parsed.data.commune,
      neighborhood: parsed.data.neighborhood,
      addressHint: parsed.data.addressHint,
      bedrooms: parsed.data.bedrooms,
      bathrooms: parsed.data.bathrooms,
      areaM2: parsed.data.areaM2,
      floor: parsed.data.floor,
      parking: parsed.data.parking,
      furnished: parsed.data.furnished,
      status: "DRAFT",
      verificationStatus: "PENDING",
      amenities: {
        create: parsed.data.amenities.map((name) => ({ name }))
      }
    },
    include: { amenities: true }
  });

  await prisma.notification.create({
    data: {
      userId: session.userId,
      type: "LISTING_SUBMITTED",
      title: "Apartment submitted",
      body: "Your request has been sent successfully and is waiting for admin approval."
    }
  });

  return Response.json(
    {
      ...listing,
      message: "Your request has been sent successfully and is waiting for admin approval."
    },
    { status: 201 }
  );
}
