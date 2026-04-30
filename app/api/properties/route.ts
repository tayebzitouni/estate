import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const properties = await prisma.property.findMany({ include: { listings: true } });
  return Response.json(properties);
}

export async function POST(request: Request) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const body = await request.json();
  const property = await prisma.property.create({
    data: {
      ownerId: session.userId,
      title: body.title,
      propertyType: body.propertyType,
      wilaya: body.wilaya,
      commune: body.commune,
      neighborhood: body.neighborhood,
      addressHint: body.addressHint,
      latitude: body.latitude,
      longitude: body.longitude
    }
  });
  return Response.json(property, { status: 201 });
}
