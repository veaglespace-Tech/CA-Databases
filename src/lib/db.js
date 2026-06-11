import mysql from "mysql2/promise";
import { DEFAULT_DATABASE } from "@/config/databases";
import { assertAllowedDatabase, quoteIdentifier } from "@/utils/validators";

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
      multipleStatements: false,
    });
  }

  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function getAllowedTables(databaseName = DEFAULT_DATABASE) {
  assertAllowedDatabase(databaseName);

  const rows = await query(`SHOW TABLES FROM ${quoteIdentifier(databaseName)}`);
  const tableKey = `Tables_in_${databaseName}`;
  return rows.map((row) => row[tableKey]).filter(Boolean);
}

export async function getTableRowCount(databaseName, tableName) {
  assertAllowedDatabase(databaseName);
  const rows = await query(
    `SELECT COUNT(*) AS rowCount FROM ${quoteIdentifier(databaseName)}.${quoteIdentifier(tableName)}`
  );
  return Number(rows[0]?.rowCount || 0);
}

export async function getTablesWithCounts(databaseName = DEFAULT_DATABASE) {
  assertAllowedDatabase(databaseName);
  const tables = await getAllowedTables(databaseName);

  const counts = await Promise.all(
    tables.map(async (tableName) => ({
      name: tableName,
      rowCount: await getTableRowCount(databaseName, tableName),
    }))
  );

  return counts.sort((a, b) => a.name.localeCompare(b.name));
}
