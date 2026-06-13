import { query } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

const AUTH_DB = "CEO_CaLeads";

// ── Read ─────────────────────────────────────────────────────────────────────

export async function findAuthByUsername(username) {
  const rows = await query(
    `SELECT * FROM \`${AUTH_DB}\`.\`Auth\`
     WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
       AND is_active = 1
     LIMIT 1`,
    [username, username]
  );
  return rows[0] || null;
}

export async function findAuthByEmail(email) {
  const rows = await query(
    `SELECT * FROM \`${AUTH_DB}\`.\`Auth\` WHERE LOWER(email) = LOWER(?) AND is_active = 1 LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

export async function findAuthById(id) {
  const rows = await query(
    `SELECT id, username, email, is_active, last_login, created_at, updated_at
     FROM \`${AUTH_DB}\`.\`Auth\` WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

export async function getAllAuthUsers() {
  const rows = await query(
    `SELECT id, username, email, is_active, last_login, created_at, updated_at
     FROM \`${AUTH_DB}\`.\`Auth\`
     ORDER BY created_at DESC`
  );
  return rows;
}

// ── Write ────────────────────────────────────────────────────────────────────

export async function createAuthUser({ username, email, password }) {
  const password_hash = await hashPassword(password);
  const result = await query(
    `INSERT INTO \`${AUTH_DB}\`.\`Auth\` (username, email, password_hash)
     VALUES (?, ?, ?)`,
    [username, email, password_hash]
  );
  return { id: result.insertId, username, email };
}

export async function updateAuthUser(id, fields) {
  const allowed = ["username", "email", "is_active"];
  const updates = [];
  const values = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`\`${key}\` = ?`);
      values.push(fields[key]);
    }
  }

  if (fields.password) {
    updates.push("`password_hash` = ?");
    values.push(await hashPassword(fields.password));
  }

  if (!updates.length) return { affected: 0 };

  values.push(id);
  const result = await query(
    `UPDATE \`${AUTH_DB}\`.\`Auth\` SET ${updates.join(", ")} WHERE id = ?`,
    values
  );
  return { affected: result.affectedRows };
}

export async function deleteAuthUser(id) {
  const result = await query(
    `DELETE FROM \`${AUTH_DB}\`.\`Auth\` WHERE id = ?`,
    [id]
  );
  return { affected: result.affectedRows };
}

export async function updateLastLogin(id) {
  await query(
    `UPDATE \`${AUTH_DB}\`.\`Auth\` SET last_login = NOW() WHERE id = ?`,
    [id]
  );
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

/**
 * Seeds a default admin account if the Auth table is empty.
 * Called once on first boot from the setup endpoint.
 */
export async function seedDefaultAdmin() {
  const rows = await query(
    `SELECT COUNT(*) AS cnt FROM \`${AUTH_DB}\`.\`Auth\``
  );
  if (Number(rows[0].cnt) > 0) {
    return { seeded: false, message: "Admin already exists" };
  }

  const admin = await createAuthUser({
    username: "admin",
    email: "admin@ceocaleads.local",
    password: "Admin@1234",
  });

  return { seeded: true, user: admin };
}
