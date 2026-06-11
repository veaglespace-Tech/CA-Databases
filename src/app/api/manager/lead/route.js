import { NextResponse } from "next/server";
import { apiError } from "@/utils/validators";
import { copyRowsToManager, deleteAllManagerRows, getManagerRows } from "@/lib/managerTables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await getManagerRows("Lead");
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "Lead",
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
    const leadIds = Array.isArray(body?.leadIds) ? body.leadIds : [];
    const sourceDatabase = typeof body?.sourceDatabase === "string" ? body.sourceDatabase : "valuexpert";
    const result = await copyRowsToManager("Lead", leadIds, sourceDatabase);

    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "Lead",
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
    const result = await deleteAllManagerRows("Lead");
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "Lead",
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
