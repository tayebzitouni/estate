import { createHash, randomBytes } from "crypto";
import { mkdir, appendFile } from "fs/promises";
import path from "path";

import { prisma } from "@/lib/prisma";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createEmailVerificationToken(input: {
  userId: string;
  email: string;
  type: "REGISTRATION" | "EMAIL_CHANGE";
}) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);

  await prisma.emailVerificationToken.create({
    data: {
      userId: input.userId,
      email: input.email.toLowerCase(),
      type: input.type,
      tokenHash: hashToken(token),
      expiresAt
    }
  });

  return token;
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = process.env.APP_URL ?? "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const outboxDir = path.join(process.cwd(), ".temp");
  const outboxFile = path.join(outboxDir, "email-outbox.log");

  await mkdir(outboxDir, { recursive: true });
  await appendFile(outboxFile, `[${new Date().toISOString()}] To: ${email}\n${verificationUrl}\n\n`, "utf8");

  console.log(`Verification email for ${email}: ${verificationUrl}`);
}
