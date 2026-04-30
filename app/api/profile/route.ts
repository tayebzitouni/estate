import { NextRequest } from "next/server";

import { getCurrentSession, setSession } from "@/lib/auth";
import { toApiError } from "@/lib/data";
import { createEmailVerificationToken, sendVerificationEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { profileUpdateSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      ownedListings: {
        include: { media: true },
        orderBy: { createdAt: "desc" }
      },
      savedListings: { include: { listing: true } },
      leads: { include: { listing: true } }
    }
  });

  if (!user) return toApiError("User not found", 404);
  return Response.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = getCurrentSession();
  if (!session) return toApiError("Unauthorized", 401);

  const body = await request.json();
  const parsed = profileUpdateSchema.safeParse(body);
  if (!parsed.success) return toApiError(parsed.error.flatten().formErrors.join(", "));

  const user = await prisma.user.findUnique({ where: { id: session.userId }, include: { profile: true } });
  if (!user) return toApiError("User not found", 404);

  const normalizedEmail = parsed.data.email?.toLowerCase();
  let verificationMessage: string | undefined;

  if (normalizedEmail && normalizedEmail !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) return toApiError("Email already exists", 409);

    const token = await createEmailVerificationToken({
      userId: user.id,
      email: normalizedEmail,
      type: "EMAIL_CHANGE"
    });
    await sendVerificationEmail(normalizedEmail, token);
    verificationMessage = "Please verify your new email address.";
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      pendingEmail: normalizedEmail && normalizedEmail !== user.email ? normalizedEmail : user.pendingEmail,
      profile: {
        upsert: {
          create: {
            fullName: parsed.data.name,
            phone: parsed.data.phone,
            city: parsed.data.city,
            bio: parsed.data.bio,
            preferredLang: "ar"
          },
          update: {
            fullName: parsed.data.name,
            phone: parsed.data.phone,
            city: parsed.data.city,
            bio: parsed.data.bio
          }
        }
      }
    },
    include: { profile: true }
  });

  setSession({
    userId: updated.id,
    role: updated.role,
    email: updated.email,
    name: updated.profile?.fullName ?? updated.email
  });

  return Response.json({
    id: updated.id,
    email: updated.email,
    pendingEmail: updated.pendingEmail,
    emailVerifiedAt: updated.emailVerifiedAt,
    role: updated.role,
    profile: updated.profile,
    message: verificationMessage ?? "Profile updated successfully."
  });
}
