import { NextRequest } from "next/server";

import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { reportSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const reports = await prisma.report.findMany({ include: { listing: true }, orderBy: { createdAt: "desc" } });
  return Response.json(reports);
}

export async function POST(request: NextRequest) {
  const session = getCurrentSession();
  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));
  const report = await prisma.report.create({
    data: {
      listingId: parsed.data.listingId,
      reporterId: session?.userId,
      reason: parsed.data.reason,
      details: parsed.data.details
    }
  });
  return Response.json(report, { status: 201 });
}
