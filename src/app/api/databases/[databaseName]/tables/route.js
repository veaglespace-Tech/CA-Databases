import { NextResponse } from "next/server";
import { apiError, assertAllowedDatabase } from "@/utils/validators";
import { getTablesWithCounts } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { databaseName } = await params;
    assertAllowedDatabase(databaseName);
    const tables = await getTablesWithCounts(databaseName);
    return NextResponse.json(tables);
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
