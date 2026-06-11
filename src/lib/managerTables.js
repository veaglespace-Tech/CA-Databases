import { randomUUID } from "crypto";
import { DEFAULT_DATABASE, MANAGER_DATABASE } from "@/config/databases";
import { query } from "@/lib/db";
import { quoteIdentifier } from "@/utils/validators";

const COMMON_SOURCE_FIELDS = {
  RegistrationLead: [
    "fullName",
    "email",
    "phone",
    "city",
    "businessName",
    "registrationType",
    "message",
    "sourcePageSlug",
    "status",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "serviceId",
    "assignedToId",
    "createdAt",
    "updatedAt",
    "formType",
    "ipAddress",
    "metadata",
    "source",
    "userAgent",
    "mainCategory",
    "userId",
    "address",
    "natureOfBusiness",
    "pinCode",
    "state",
  ],
  User: ["name", "email", "phone", "role", "createdAt", "updatedAt", "referralCode", "referredByCode", "sourceDatabase"],
  ContactQuery: ["name", "email", "phone", "subject", "message", "isRead", "createdAt", "updatedAt", "status"],
  Lead: [
    "fullName",
    "email",
    "phone",
    "city",
    "serviceName",
    "businessName",
    "preferredTime",
    "message",
    "sourcePageSlug",
    "pagePath",
    "source",
    "formType",
    "status",
    "utmSource",
    "utmMedium",
    "utmCampaign",
    "ipAddress",
    "userAgent",
    "metadata",
    "serviceId",
    "assignedToId",
    "createdAt",
    "updatedAt",
    "userId",
  ],
};

export const MANAGER_TABLE_CONFIGS = {
  RegistrationLead: {
    sourceIdColumn: "sourceLeadId",
    fields: COMMON_SOURCE_FIELDS.RegistrationLead,
    createSql: `
      CREATE TABLE IF NOT EXISTS {{table}} (
        id varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        sourceLeadId varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        fullName varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        email varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        phone varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        city varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        businessName varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        registrationType varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        message varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        sourcePageSlug varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        status varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmSource varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmMedium varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmCampaign varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        serviceId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        assignedToId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        createdAt datetime(3) DEFAULT NULL,
        updatedAt datetime(3) DEFAULT NULL,
        formType varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        ipAddress varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        metadata json DEFAULT NULL,
        source varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        userAgent varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        mainCategory varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        userId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        address varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        natureOfBusiness varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        pinCode varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        state varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        copiedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        sourceDatabase varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY RegistrationLead_sourceLeadId_key (sourceLeadId),
        KEY RegistrationLead_status_copiedAt_idx (status, copiedAt),
        KEY RegistrationLead_phone_idx (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  User: {
    sourceIdColumn: "sourceUserId",
    fields: COMMON_SOURCE_FIELDS.User,
    createSql: `
      CREATE TABLE IF NOT EXISTS {{table}} (
        id varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        sourceUserId varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        email varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        phone varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        role varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        createdAt datetime(3) DEFAULT NULL,
        updatedAt datetime(3) DEFAULT NULL,
        referralCode varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        referredByCode varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        copiedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        sourceDatabase varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY User_sourceUserId_key (sourceUserId),
        KEY User_email_idx (email),
        KEY User_phone_idx (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  ContactQuery: {
    sourceIdColumn: "sourceContactQueryId",
    fields: COMMON_SOURCE_FIELDS.ContactQuery,
    createSql: `
      CREATE TABLE IF NOT EXISTS {{table}} (
        id varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        sourceContactQueryId varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        name varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        email varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        phone varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        subject varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        message text COLLATE utf8mb4_unicode_ci,
        isRead tinyint(1) DEFAULT NULL,
        createdAt datetime(3) DEFAULT NULL,
        updatedAt datetime(3) DEFAULT NULL,
        status varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        copiedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        sourceDatabase varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY ContactQuery_sourceContactQueryId_key (sourceContactQueryId),
        KEY ContactQuery_status_copiedAt_idx (status, copiedAt),
        KEY ContactQuery_phone_idx (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
  Lead: {
    sourceIdColumn: "sourceLeadId",
    fields: COMMON_SOURCE_FIELDS.Lead,
    createSql: `
      CREATE TABLE IF NOT EXISTS {{table}} (
        id varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        sourceLeadId varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
        fullName varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        email varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        phone varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        city varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        serviceName varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        businessName varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        preferredTime varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        message varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        sourcePageSlug varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        pagePath varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        source varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        formType varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        status varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmSource varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmMedium varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        utmCampaign varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        ipAddress varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        userAgent varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        metadata json DEFAULT NULL,
        serviceId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        assignedToId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        createdAt datetime(3) DEFAULT NULL,
        updatedAt datetime(3) DEFAULT NULL,
        userId varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        copiedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        sourceDatabase varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
        PRIMARY KEY (id),
        UNIQUE KEY Lead_sourceLeadId_key (sourceLeadId),
        KEY Lead_status_copiedAt_idx (status, copiedAt),
        KEY Lead_phone_idx (phone)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `,
  },
};

export const MANAGER_COPY_TABLES = Object.keys(MANAGER_TABLE_CONFIGS);

function tableRef(databaseName, tableName) {
  return `${quoteIdentifier(databaseName)}.${quoteIdentifier(tableName)}`;
}

function managerTableRef(tableName) {
  return tableRef(MANAGER_DATABASE, tableName);
}

function getConfig(tableName) {
  const config = MANAGER_TABLE_CONFIGS[tableName];
  if (!config) {
    const error = new Error("Unsupported manager table");
    error.status = 404;
    throw error;
  }
  return config;
}

function normalizeValue(value) {
  if (value === undefined) return null;
  if (value && typeof value === "object" && !(value instanceof Date)) return JSON.stringify(value);
  return value;
}

function readMetadata(metadata) {
  if (!metadata) return {};
  if (typeof metadata === "object") return metadata;
  try {
    return JSON.parse(metadata);
  } catch {
    return {};
  }
}

function fieldValue(row, field) {
  const value = row[field];
  if (value !== null && value !== undefined && value !== "") return value;

  if (["address", "state", "pinCode", "natureOfBusiness"].includes(field)) {
    return readMetadata(row.metadata)[field] ?? null;
  }

  return value;
}

export async function ensureManagerTable(tableName) {
  const config = getConfig(tableName);
  await query(`CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(MANAGER_DATABASE)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await query(config.createSql.replaceAll("{{table}}", managerTableRef(tableName)));
}

export async function ensureAllManagerTables() {
  await Promise.all(MANAGER_COPY_TABLES.map((tableName) => ensureManagerTable(tableName)));
}

export async function getManagerRows(tableName) {
  const config = getConfig(tableName);
  await ensureManagerTable(tableName);
  const columns = ["id", config.sourceIdColumn, ...config.fields, "copiedAt", "sourceDatabase"].map(quoteIdentifier).join(", ");
  return query(`SELECT ${columns} FROM ${managerTableRef(tableName)} ORDER BY copiedAt DESC LIMIT 100`);
}

export async function copyRowsToManager(tableName, rowIds, sourceDatabase = DEFAULT_DATABASE) {
  const config = getConfig(tableName);
  const uniqueIds = [...new Set(rowIds.filter((rowId) => typeof rowId === "string" && rowId.trim()).map((rowId) => rowId.trim()))];
  if (uniqueIds.length === 0) {
    const error = new Error(`Select at least one ${tableName} row`);
    error.status = 400;
    throw error;
  }

  await ensureManagerTable(tableName);

  // Ensure the sourceDatabase column exists (safe ALTER for existing tables)
  try {
    await query(`ALTER TABLE ${managerTableRef(tableName)} ADD COLUMN sourceDatabase varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL`);
  } catch (e) { /* column already exists — ignore */ }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  // Exclude sourceDatabase from source fields as it's a manager-only field
  const srcFields = config.fields.filter((f) => f !== "sourceDatabase");
  const sourceColumns = [`id AS ${quoteIdentifier(config.sourceIdColumn)}`, ...srcFields.map(quoteIdentifier)].join(", ");
  const sourceRows = await query(`SELECT ${sourceColumns} FROM ${tableRef(sourceDatabase, tableName)} WHERE id IN (${placeholders})`, uniqueIds);
  if (sourceRows.length === 0) return { copied: 0, rows: await getManagerRows(tableName) };

  const insertColumns = ["id", config.sourceIdColumn, ...srcFields, "sourceDatabase"].map(quoteIdentifier).join(", ");
  const updateColumns = [...srcFields, "sourceDatabase"].map((field) => `${quoteIdentifier(field)} = VALUES(${quoteIdentifier(field)})`).join(", ");

  for (const row of sourceRows) {
    const values = [randomUUID(), row[config.sourceIdColumn], ...srcFields.map((field) => normalizeValue(fieldValue(row, field))), sourceDatabase];
    const valuePlaceholders = values.map(() => "?").join(", ");

    await query(
      `INSERT INTO ${managerTableRef(tableName)} (${insertColumns}) VALUES (${valuePlaceholders})
       ON DUPLICATE KEY UPDATE ${updateColumns}, copiedAt = CURRENT_TIMESTAMP(3)`,
      values
    );
  }

  return { copied: sourceRows.length, rows: await getManagerRows(tableName) };
}

export async function deleteManagerRows(tableName, rowIds = []) {
  getConfig(tableName);
  await ensureManagerTable(tableName);

  const uniqueIds = [...new Set(rowIds.filter((rowId) => typeof rowId === "string" && rowId.trim()).map((rowId) => rowId.trim()))];
  if (uniqueIds.length === 0) {
    const error = new Error(`Select at least one ${tableName} row to delete`);
    error.status = 400;
    throw error;
  }

  const placeholders = uniqueIds.map(() => "?").join(", ");
  const result = await query(`DELETE FROM ${managerTableRef(tableName)} WHERE id IN (${placeholders})`, uniqueIds);
  return { deleted: result.affectedRows || 0, rows: await getManagerRows(tableName) };
}

export async function deleteAllManagerRows(tableName) {
  getConfig(tableName);
  await ensureManagerTable(tableName);
  const result = await query(`DELETE FROM ${managerTableRef(tableName)}`);
  return { deleted: result.affectedRows || 0, rows: [] };
}
