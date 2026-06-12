import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "ceo-ca-leads-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";
const COOKIE_NAME = "auth_token";

const secretKey = new TextEncoder().encode(JWT_SECRET);

// ── Token helpers ────────────────────────────────────────────────────────────

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(JWT_EXPIRES_IN)
    .sign(secretKey);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

// ── Password helpers ─────────────────────────────────────────────────────────

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

export async function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

// ── Cookie helpers (Next.js response) ────────────────────────────────────────

export function setAuthCookie(response, token) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return response;
}

export function clearAuthCookie(response) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;

// ── Request-level auth extraction ────────────────────────────────────────────

/**
 * Extract and verify the JWT from a Next.js Request object.
 * Returns the decoded payload or null.
 */
export async function getAuthPayload(request) {
  const cookie = request.cookies?.get(COOKIE_NAME)?.value;
  if (!cookie) return null;
  return await verifyToken(cookie);
}

/**
 * Guard helper – returns a 401 Response when not authenticated.
 * Usage:  const guard = await requireAuth(request); if (guard) return guard;
 */
export async function requireAuth(request, roles = []) {
  const payload = await getAuthPayload(request);
  if (!payload) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  if (roles.length && !roles.includes(payload.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }
  return null; // all good
}
