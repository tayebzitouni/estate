import { getCurrentSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { profile: true }
  });
  if (!user) return toApiError("Unauthorized", 401);
  return Response.json({
    ...session,
    emailVerifiedAt: user.emailVerifiedAt,
    pendingEmail: user.pendingEmail,
    profile: user.profile
  });
}
