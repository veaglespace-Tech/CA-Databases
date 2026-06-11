import { NextResponse } from "next/server";
import { apiError, assertAllowedDatabase } from "@/utils/validators";
import { getDatabaseSummary } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { databaseName } = await params;
    assertAllowedDatabase(databaseName);
    const database = await getDatabaseSummary(databaseName);
    return NextResponse.json({
      ...database,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
