import { NextResponse } from "next/server";
import { comparePassword } from "@/lib/auth";
import { findAuthByEmail, updateLastLogin } from "@/lib/authDb";
import { signToken, setAuthCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Look up user
    const user = await findAuthByEmail(email.trim());
    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Issue JWT
    const payload = { id: user.id, username: user.username, email: user.email, role: user.role };
    const token = await signToken(payload);

    // Update last login (fire-and-forget)
    updateLastLogin(user.id).catch(() => {});

    const response = NextResponse.json({
      message: "Login successful",
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });

    return setAuthCookie(response, token);
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
