import { NextResponse } from "next/server";
import { apiError, assertAllowedDatabase, assertAllowedTable, maskSensitiveRows, quoteIdentifier } from "@/utils/validators";
import { getAllowedTables, getTableRowCount, query } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  try {
    const { databaseName, tableName } = await params;
    assertAllowedDatabase(databaseName);
    await assertAllowedTable(databaseName, tableName, getAllowedTables);

    const qualifiedTable = `${quoteIdentifier(databaseName)}.${quoteIdentifier(tableName)}`;
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
    const rowCount = await getTableRowCount(databaseName, tableName);

    return NextResponse.json({
      database: databaseName,
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
