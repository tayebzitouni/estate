import { createHash, randomBytes } from "crypto";
import { mkdir, appendFile } from "fs/promises";
import os from "os";
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
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "Darak <onboarding@resend.dev>",
        to: email,
        subject: "Verify your Darak account",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
            <h1>Verify your Darak account</h1>
            <p>Click the button below to verify your email address.</p>
            <p><a href="${verificationUrl}" style="display:inline-block;border-radius:999px;background:#10b981;color:white;padding:12px 18px;text-decoration:none">Verify email</a></p>
            <p>If the button does not work, copy this link:</p>
            <p>${verificationUrl}</p>
          </div>
        `
      })
    });

    if (!response.ok) {
      throw new Error(`Resend email failed: ${await response.text()}`);
    }

    return;
  }

  const outboxDir = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), ".temp");
  const outboxFile = path.join(outboxDir, "email-outbox.log");

  try {
    await mkdir(outboxDir, { recursive: true });
    await appendFile(outboxFile, `[${new Date().toISOString()}] To: ${email}\n${verificationUrl}\n\n`, "utf8");
  } catch (error) {
    console.error("Unable to write verification outbox", error);
  }

  console.log(`Verification email for ${email}: ${verificationUrl}`);
}
