import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { updateAuthUser, deleteAuthUser } from "@/lib/authDb";

export const dynamic = "force-dynamic";

// PATCH /api/auth/users/[id]  →  update user (admin only)
export async function PATCH(request, { params }) {
  const guard = await requireAuth(request, ["admin"]);
  if (guard) return guard;

  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const body = await request.json();
    const result = await updateAuthUser(id, body);
    return NextResponse.json({ message: "User updated", ...result });
  } catch (err) {
    if (err?.code === "ER_DUP_ENTRY") {
      return NextResponse.json({ error: "Username or email already exists" }, { status: 409 });
    }
    console.error("[auth/users PATCH]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/auth/users/[id]  →  delete user (admin only)
export async function DELETE(request, { params }) {
  const guard = await requireAuth(request, ["admin"]);
  if (guard) return guard;

  try {
    const { id: paramId } = await params;
    const id = Number(paramId);
    const result = await deleteAuthUser(id);
    return NextResponse.json({ message: "User deleted", ...result });
  } catch (err) {
    console.error("[auth/users DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
