import { NextRequest } from "next/server";

import { hashPassword, setSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));

  const normalizedEmail = parsed.data.email.toLowerCase();
  const passwordHash = hashPassword(parsed.data.password);

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { profile: true }
  });
  if (existing) {
    if (!existing.emailVerifiedAt) {
      setSession({
        userId: existing.id,
        role: existing.role,
        email: existing.email,
        name: existing.profile?.fullName ?? existing.email
      });

      try {
        const token = await createEmailVerificationToken({
          userId: existing.id,
          email: existing.email,
          type: "REGISTRATION"
        });
        await sendVerificationEmail(existing.email, token);
      } catch (error) {
        console.error("Unable to resend verification email", error);
        return toApiError("Unable to send verification email. Please try again later.", 502);
      }

      return Response.json({
        id: existing.id,
        email: existing.email,
        role: existing.role,
        name: existing.profile?.fullName,
        emailVerifiedAt: existing.emailVerifiedAt,
        message: "This email is already registered but not verified. We sent a new verification link."
      });
    }

    return toApiError("Email already exists", 409);
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      role: parsed.data.role,
      profile: {
        create: {
          fullName: parsed.data.name,
          preferredLang: "ar"
        }
      },
      verificationProfile: {
        create: {
          legalName: parsed.data.name,
          status: "PENDING"
        }
      }
    },
    include: { profile: true }
  });

  setSession({
    userId: user.id,
    role: user.role,
    email: user.email,
    name: user.profile?.fullName ?? user.email
  });

  try {
    const token = await createEmailVerificationToken({
      userId: user.id,
      email: user.email,
      type: "REGISTRATION"
    });
    await sendVerificationEmail(user.email, token);
  } catch (error) {
    console.error("Unable to send verification email", error);
    await prisma.user.delete({ where: { id: user.id } });
    return toApiError("Unable to send verification email. Please try again later.", 502);
  }

  return Response.json(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.profile?.fullName,
      emailVerifiedAt: user.emailVerifiedAt,
      message: "Please verify your email address."
    },
    { status: 201 }
  );
}
