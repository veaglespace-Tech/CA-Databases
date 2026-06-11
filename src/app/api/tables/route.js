import { NextResponse } from "next/server";
import { DEFAULT_DATABASE } from "@/config/databases";
import { apiError, assertAllowedDatabase } from "@/utils/validators";
import { getTablesWithCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    assertAllowedDatabase(DEFAULT_DATABASE);
    const tables = await getTablesWithCounts(DEFAULT_DATABASE);
    return NextResponse.json(tables);
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
