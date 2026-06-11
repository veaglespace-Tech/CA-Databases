import { NextResponse } from "next/server";
import { apiError } from "@/utils/validators";
import { getMatchingDatabasesWithTables } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databases = await getMatchingDatabasesWithTables();
    return NextResponse.json({
      databases,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
