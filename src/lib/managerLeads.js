import { randomUUID } from "crypto";
import { DEFAULT_DATABASE, MANAGER_DATABASE } from "@/config/databases";
import { query } from "@/lib/db";
import { quoteIdentifier } from "@/utils/validators";

const SOURCE_TABLE = `${quoteIdentifier(DEFAULT_DATABASE)}.${quoteIdentifier("RegistrationLead")}`;
const MANAGER_TABLE = `${quoteIdentifier(MANAGER_DATABASE)}.${quoteIdentifier("RegistrationLead")}`;

const LEAD_FIELDS = [
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
];

const SELECT_SOURCE_FIELDS = [`id AS sourceLeadId`, ...LEAD_FIELDS].map((field) => {
  if (field.includes(" AS ")) return field;
  return quoteIdentifier(field);
}).join(", ");

const MANAGER_SELECT_FIELDS = [
  "id",
  "sourceLeadId",
  ...LEAD_FIELDS,
  "copiedAt",
].map(quoteIdentifier).join(", ");

export async function ensureManagerLeadTable() {
  await query(`CREATE DATABASE IF NOT EXISTS ${quoteIdentifier(MANAGER_DATABASE)} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await query(`
    CREATE TABLE IF NOT EXISTS ${MANAGER_TABLE} (
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
  `);
}

export async function getManagerLeads() {
  await ensureManagerLeadTable();
  return query(`SELECT ${MANAGER_SELECT_FIELDS}, \`sourceDatabase\` FROM ${MANAGER_TABLE} ORDER BY copiedAt DESC LIMIT 100`);
}

function normalizeLeadValue(value) {
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

function leadFieldValue(row, field) {
  const value = row[field];
  if (value !== null && value !== undefined && value !== "") return value;

  const metadata = readMetadata(row.metadata);
  if (["address", "state", "pinCode", "natureOfBusiness"].includes(field)) {
    return metadata[field] ?? null;
  }

  return value;
}

export async function copyRegistrationLeadsToManager(leadIds, sourceDatabase = DEFAULT_DATABASE) {
  const uniqueLeadIds = [...new Set(leadIds.filter((leadId) => typeof leadId === "string" && leadId.trim()).map((leadId) => leadId.trim()))];
  if (uniqueLeadIds.length === 0) {
    const error = new Error("Select at least one registration lead");
    error.status = 400;
    throw error;
  }

  await ensureManagerLeadTable();

  // Ensure sourceDatabase column exists on older tables
  try {
    await query(`ALTER TABLE ${MANAGER_TABLE} ADD COLUMN \`sourceDatabase\` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL`);
  } catch (e) { /* column already exists — ignore */ }

  const placeholders = uniqueLeadIds.map(() => "?").join(", ");
  const sourceRows = await query(`SELECT ${SELECT_SOURCE_FIELDS} FROM ${SOURCE_TABLE} WHERE id IN (${placeholders})`, uniqueLeadIds);
  if (sourceRows.length === 0) return { copied: 0, leads: await getManagerLeads() };

  for (const row of sourceRows) {
    const values = [randomUUID(), row.sourceLeadId, ...LEAD_FIELDS.map((field) => normalizeLeadValue(leadFieldValue(row, field))), sourceDatabase];
    const insertColumns = ["id", "sourceLeadId", ...LEAD_FIELDS, "sourceDatabase"].map(quoteIdentifier).join(", ");
    const insertPlaceholders = values.map(() => "?").join(", ");
    const updateColumns = [...LEAD_FIELDS, "sourceDatabase"].map((field) => `${quoteIdentifier(field)} = VALUES(${quoteIdentifier(field)})`).join(", ");

    await query(
      `INSERT INTO ${MANAGER_TABLE} (${insertColumns}) VALUES (${insertPlaceholders})
       ON DUPLICATE KEY UPDATE ${updateColumns}, copiedAt = CURRENT_TIMESTAMP(3)`,
      values
    );
  }

  return { copied: sourceRows.length, leads: await getManagerLeads() };
}
