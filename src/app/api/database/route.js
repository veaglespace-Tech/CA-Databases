import { NextResponse } from "next/server";
import { DEFAULT_DATABASE } from "@/config/databases";
import { apiError, assertAllowedDatabase } from "@/utils/validators";
import { getTablesWithCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    assertAllowedDatabase(DEFAULT_DATABASE);
    const tables = await getTablesWithCounts(DEFAULT_DATABASE);
    const totalRows = tables.reduce((sum, table) => sum + table.rowCount, 0);

    return NextResponse.json({
      database: DEFAULT_DATABASE,
      tableCount: tables.length,
      totalRows,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
