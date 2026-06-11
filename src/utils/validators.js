import { ALLOWED_DATABASES } from "@/config/databases";

const SENSITIVE_COLUMN_PATTERN = /(password|passcode|passwd|secret|token|otp|hash|salt|api[_-]?key|private[_-]?key)/i;

export function isAllowedDatabase(databaseName) {
  return ALLOWED_DATABASES.includes(databaseName);
}

export function assertAllowedDatabase(databaseName) {
  if (!isAllowedDatabase(databaseName)) {
    const error = new Error("Forbidden database");
    error.status = 403;
    throw error;
  }
}

export function isSafeIdentifier(identifier) {
  return (
    typeof identifier === "string" &&
    identifier.length > 0 &&
    identifier.length <= 64 &&
    !identifier.includes("\0") &&
    !identifier.includes("/")
  );
}

export function quoteIdentifier(identifier) {
  if (!isSafeIdentifier(identifier)) {
    const error = new Error("Invalid identifier");
    error.status = 400;
    throw error;
  }

  return `\`${identifier.replaceAll("`", "``")}\``;
}

export async function assertAllowedTable(databaseName, tableName, getAllowedTables) {
  assertAllowedDatabase(databaseName);

  if (!isSafeIdentifier(tableName)) {
    const error = new Error("Invalid table name");
    error.status = 400;
    throw error;
  }

  const allowedTables = await getAllowedTables(databaseName);
  if (!allowedTables.includes(tableName)) {
    const error = new Error("Forbidden table");
    error.status = 403;
    throw error;
  }
}

export function apiError(error) {
  const status = error.status || 500;
  if (status === 500) {
    console.error("Database dashboard API error:", error);
  }

  const message = status === 500 ? "Database request failed. Check server logs and MySQL credentials." : error.message;
  return { status, body: { error: message } };
}

export function isSensitiveColumn(columnName) {
  return SENSITIVE_COLUMN_PATTERN.test(columnName);
}

export function maskSensitiveRows(rows, columns) {
  const sensitiveColumns = new Set(columns.map((column) => column.name).filter(isSensitiveColumn));

  if (sensitiveColumns.size === 0) {
    return rows;
  }

  return rows.map((row) => {
    const maskedRow = { ...row };
    for (const columnName of sensitiveColumns) {
      if (Object.prototype.hasOwnProperty.call(maskedRow, columnName)) {
        maskedRow[columnName] = maskedRow[columnName] === null ? null : "[hidden]";
      }
    }
    return maskedRow;
  });
}
