import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { profile: true, verificationProfile: true },
    orderBy: { createdAt: "desc" }
  });
  return Response.json(users);
}
