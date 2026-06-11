import { NextResponse } from "next/server";
import { DEFAULT_DATABASE } from "@/config/databases";
import { apiError, assertAllowedDatabase, assertAllowedTable, maskSensitiveRows, quoteIdentifier } from "@/utils/validators";
import { getAllowedTables, getTableRowCount, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    assertAllowedDatabase(DEFAULT_DATABASE);
    const { tableName } = await params;
    await assertAllowedTable(DEFAULT_DATABASE, tableName, getAllowedTables);

    const qualifiedTable = `${quoteIdentifier(DEFAULT_DATABASE)}.${quoteIdentifier(tableName)}`;
    const rawColumns = await query(`SHOW COLUMNS FROM ${qualifiedTable}`);
    const columns = rawColumns.map((column) => ({
      name: column.Field,
      type: column.Type,
      nullable: column.Null === "YES",
      key: column.Key,
      default: column.Default,
      extra: column.Extra,
    }));
    const rows = maskSensitiveRows(await query(`SELECT * FROM ${qualifiedTable} LIMIT 100`), columns);
    const rowCount = await getTableRowCount(DEFAULT_DATABASE, tableName);

    return NextResponse.json({
      database: DEFAULT_DATABASE,
      tableName,
      totalRecords: rowCount,
      columns,
      rows,
      limit: 100,
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    const { status, body } = apiError(error);
    return NextResponse.json(body, { status });
  }
}
