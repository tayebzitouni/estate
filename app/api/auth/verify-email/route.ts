import { NextRequest, NextResponse } from "next/server";

import { hashToken } from "@/lib/email";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const locale = request.nextUrl.searchParams.get("locale") ?? "ar";

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/settings?verify=invalid`, request.url));
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true }
  });

  if (!verification || verification.usedAt) {
    return NextResponse.redirect(new URL(`/${locale}/settings?verify=invalid`, request.url));
  }

  if (verification.expiresAt < new Date()) {
    return NextResponse.redirect(new URL(`/${locale}/settings?verify=expired`, request.url));
  }

  if (verification.type === "EMAIL_CHANGE") {
    const existing = await prisma.user.findUnique({ where: { email: verification.email } });
    if (existing && existing.id !== verification.userId) {
      return NextResponse.redirect(new URL(`/${locale}/settings?verify=taken`, request.url));
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data:
        verification.type === "EMAIL_CHANGE"
          ? {
              email: verification.email,
              pendingEmail: null,
              emailVerifiedAt: new Date()
            }
          : {
              emailVerifiedAt: new Date()
            }
    }),
    prisma.emailVerificationToken.update({
      where: { id: verification.id },
      data: { usedAt: new Date() }
    })
  ]);

  return NextResponse.redirect(new URL(`/${locale}/settings?verify=success`, request.url));
}
