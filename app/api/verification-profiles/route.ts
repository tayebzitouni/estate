import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = await prisma.verificationProfile.findMany({ orderBy: { status: "asc" } });
  return Response.json(profiles);
}
