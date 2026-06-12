import mysql from "mysql2/promise";
import { DEFAULT_DATABASE, VALUEXPERT_DATABASE_FRAGMENT, VALUEXPERT_MAIN_TABLES } from "@/config/databases";
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
  const tables = rows.map((row) => row[tableKey]).filter(Boolean);

  if (databaseName.toLowerCase().includes(VALUEXPERT_DATABASE_FRAGMENT)) {
    return tables.filter((tableName) => VALUEXPERT_MAIN_TABLES.includes(tableName));
  }

  return tables;
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
  
  // Get exactly which tables are allowed/visible for this database
  const allowedTableNames = await getAllowedTables(databaseName);
  if (!allowedTableNames.length) return [];

  // Query information_schema for fast approximate row counts of ALL tables in this db at once
  const rows = await query(
    `SELECT TABLE_NAME as name, TABLE_ROWS as rowCount 
     FROM information_schema.TABLES 
     WHERE TABLE_SCHEMA = ?`,
    [databaseName]
  );
  
  // Map rows to a dictionary for fast lookup
  const countMap = {};
  for (const row of rows) {
    countMap[row.name] = Number(row.rowCount || 0);
  }

  // Filter only allowed tables and assign their count (O(1) lookup)
  const tables = allowedTableNames.map(name => ({
    name,
    rowCount: countMap[name] || 0
  }));

  return tables.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getMatchingDatabases() {
  const rows = await query(
    "SELECT schema_name AS databaseName FROM information_schema.schemata WHERE LOWER(schema_name) LIKE ? ORDER BY schema_name",
    [`%${VALUEXPERT_DATABASE_FRAGMENT.toLowerCase()}%`]
  );

  return rows.map((row) => row.databaseName).filter(Boolean);
}

export async function getDatabaseSummary(databaseName) {
  assertAllowedDatabase(databaseName);
  const tables = await getTablesWithCounts(databaseName);
  const totalRows = tables.reduce((sum, table) => sum + table.rowCount, 0);

  return {
    database: databaseName,
    tableCount: tables.length,
    totalRows,
    tables,
  };
}

export async function getMatchingDatabasesWithTables() {
  const databases = await getMatchingDatabases();
  const summaries = await Promise.all(databases.map((databaseName) => getDatabaseSummary(databaseName)));
  return summaries.sort((a, b) => a.database.localeCompare(b.database));
}
