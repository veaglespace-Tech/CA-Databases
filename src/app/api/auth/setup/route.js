import { NextResponse } from "next/server";
import { seedDefaultAdmin } from "@/lib/authDb";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/setup
 * Seeds the default admin user if the Auth table is empty.
 * This endpoint is intentionally public so it can be called once on first boot.
 * After seeding, immediately change the default password via the Admin panel.
 */
export async function GET() {
  try {
    const result = await seedDefaultAdmin();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[auth/setup]", err);
    return NextResponse.json({ error: "Setup failed", detail: err.message }, { status: 500 });
  }
}
