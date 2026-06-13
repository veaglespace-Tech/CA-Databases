import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/auth";
import { findAuthById } from "@/lib/authDb";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const payload = await getAuthPayload(request);
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const user = await findAuthById(payload.id);
    if (!user || !user.is_active) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("[auth/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
