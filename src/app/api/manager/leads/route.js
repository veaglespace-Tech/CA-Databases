import { NextResponse } from "next/server";
import { apiError } from "@/utils/validators";
import { copyRegistrationLeadsToManager, getManagerLeads } from "@/lib/managerLeads";
import { deleteAllManagerRows } from "@/lib/managerTables";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await getManagerLeads();
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "RegistrationLead",
      rows: leads,
      totalRecords: leads.length,
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
    const result = await copyRegistrationLeadsToManager(leadIds, sourceDatabase);

    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "RegistrationLead",
      copied: result.copied,
      rows: result.leads,
      totalRecords: result.leads.length,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}

export async function DELETE() {
  try {
    const result = await deleteAllManagerRows("RegistrationLead");
    return NextResponse.json({
      database: "CEO_CaLeads",
      tableName: "RegistrationLead",
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
