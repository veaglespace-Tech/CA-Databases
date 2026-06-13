import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getAllAuthUsers, createAuthUser, updateAuthUser, deleteAuthUser } from "@/lib/authDb";

export const dynamic = "force-dynamic";

// GET /api/auth/users  →  list all auth users (authenticated users)
export async function GET(request) {
  const guard = await requireAuth(request);
  if (guard) return guard;

  try {
    const users = await getAllAuthUsers();
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[auth/users GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/auth/users  →  create a new auth user (authenticated users)
export async function POST(request) {
  const guard = await requireAuth(request);
  if (guard) return guard;

  try {
    const body = await request.json();
    const { username, email, password } = body || {};

    if (!username || !email || !password) {
      return NextResponse.json({ error: "username, email, and password are required" }, { status: 400 });
    }

    const user = await createAuthUser({ username, email, password });
    return NextResponse.json({ message: "User created", user }, { status: 201 });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    }
    console.error("[auth/users POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
