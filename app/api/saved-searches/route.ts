import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { parseBody, toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { savedSearchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const searches = await prisma.savedSearch.findMany({ where: { userId: session.userId } });
  return Response.json(searches);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const body = await request.json();
  const parsed = savedSearchSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));
  const search = await prisma.savedSearch.create({
    data: {
      userId: session.userId,
      name: parsed.data.name,
      filters: parseBody(parsed.data.filters),
      notifyByEmail: parsed.data.notifyByEmail
    }
  });
  return Response.json(search, { status: 201 });
}
