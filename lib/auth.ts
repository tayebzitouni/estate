import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "darak_session";

type SessionPayload = {
  userId: string;
  role: string;
  email: string;
  name: string;
};

function getSecret() {
  return process.env.AUTH_SECRET ?? "dev-secret-change-me";
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  const passwordHash = scryptSync(password, salt, 64);
  const storedHash = Buffer.from(hash, "hex");
  return timingSafeEqual(passwordHash, storedHash);
}

function sign(payload: string) {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionCookie(session: SessionPayload) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

export function parseSessionCookie(raw?: string | null): SessionPayload | null {
  if (!raw) {
    return null;
  }

  const [payload, signature] = raw.split(".");
  if (!payload || !signature || sign(payload) !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export function getCurrentSession() {
  const store = cookies();
  const session = parseSessionCookie(store.get(SESSION_COOKIE)?.value);
  return session;
}

export function setSession(session: SessionPayload) {
  cookies().set(SESSION_COOKIE, createSessionCookie(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
}

export function clearSession() {
  cookies().delete(SESSION_COOKIE);
}
