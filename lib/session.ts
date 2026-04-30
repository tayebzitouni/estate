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

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export async function verifySessionCookieEdge(raw?: string | null): Promise<SessionPayload | null> {
  if (!raw) return null;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return null;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signed = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const hex = Array.from(new Uint8Array(signed))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  if (hex !== signature) return null;

  try {
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as SessionPayload;
  } catch {
    return null;
  }
}
