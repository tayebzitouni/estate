import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const profiles = await prisma.profile.findMany({ orderBy: { fullName: "asc" } });
  return Response.json(profiles);
}
