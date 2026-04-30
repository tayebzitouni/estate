import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getSessionCookieName, verifySessionCookieEdge } from "@/lib/session";

const roleGuards = [
  { matcher: /^\/(ar|fr|en)\/admin/, roles: ["ADMIN"] },
  { matcher: /^\/(ar|fr|en)\/dashboard/, roles: ["OWNER", "AGENT", "PROPERTY_MANAGER", "ADMIN"] }
];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const guard = roleGuards.find((item) => item.matcher.test(pathname));

  if (!guard) {
    return NextResponse.next();
  }

  const session = await verifySessionCookieEdge(request.cookies.get(getSessionCookieName())?.value);
  if (!session) {
    return NextResponse.redirect(new URL("/ar/login", request.url));
  }

  if (!guard.roles.includes(session.role)) {
    return NextResponse.redirect(new URL("/ar", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/ar/:path*", "/fr/:path*", "/en/:path*"]
};
