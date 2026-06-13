import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

// Routes that are ALWAYS public (no auth needed)
const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/api/auth/setup",
  "/api/auth/logout",
];

const COOKIE_NAME = "auth_token";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Always allow public routes
  if (PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Validate JWT cookie on ALL other routes
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  if (!payload) {
    // API routes → return 401 JSON (client handles it)
    if (pathname.startsWith("/api/")) {
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Page routes → redirect to login, preserving the intended destination
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Inject authenticated user info into request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-auth-id", String(payload.id));
  requestHeaders.set("x-auth-username", payload.username);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets:
     * - _next/static (static files)
     * - _next/image  (image optimisation)
     * - favicon.ico
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
