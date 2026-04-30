import { NextRequest } from "next/server";

import { setSession, verifyPassword } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
    include: { profile: true }
  });

  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return toApiError("Invalid credentials", 401);
  }

  setSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.profile?.fullName ?? user.email
  });

  return Response.json({
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.profile?.fullName
  });
}
