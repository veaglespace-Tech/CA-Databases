import { NextResponse } from "next/server";
import { apiError } from "@/utils/validators";
import { deleteManagerRows } from "@/lib/managerTables";

export const dynamic = "force-dynamic";

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    const result = await deleteManagerRows("Lead", [id]);
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
