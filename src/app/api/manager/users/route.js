import { NextResponse } from "next/server";
import { apiError } from "@/utils/validators";
import { copyRowsToManager, deleteAllManagerRows, getManagerRows } from "@/lib/managerTables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getManagerRows("User");
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "User",
      rows,
      totalRecords: rows.length,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const userIds = Array.isArray(body?.userIds) ? body.userIds : [];
    const sourceDatabase = typeof body?.sourceDatabase === "string" ? body.sourceDatabase : "valuexpert";
    const result = await copyRowsToManager("User", userIds, sourceDatabase);

    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "User",
      copied: result.copied,
      rows: result.rows,
      totalRecords: result.rows.length,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE() {
  try {
    const result = await deleteAllManagerRows("User");
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "User",
      deleted: result.deleted,
      rows: result.rows,
      totalRecords: result.rows.length,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
