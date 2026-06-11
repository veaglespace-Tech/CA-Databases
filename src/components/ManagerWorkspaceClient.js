"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw, Trash2, Trash, FileDown } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import SearchBar from "@/components/SearchBar";
import { TableSkeleton } from "@/components/Skeletons";
import { DATABASE_DISPLAY_NAMES, MANAGER_DATABASE } from "@/config/databases";
import { downloadCsv } from "@/utils/exportCsv";

const EMPTY_TEXT = "Not provided";

// Source DB badge — shows which database the entry was copied from
function SourceDbBadge({ value }) {
  const label = value || "unknown";
  return (
    <span className="inline-flex h-7 items-center rounded-md bg-indigo-50 px-2 text-xs font-bold text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-200 dark:ring-indigo-900">
      {label}
    </span>
  );
}

const LEAD_COLUMNS = [
  { key: "sourceDatabase", label: "Source DB", width: "min-w-36" },
  { key: "fullName", label: "Name", width: "min-w-44" },
  { key: "email", label: "Email", width: "min-w-56" },
  { key: "phone", label: "Phone", width: "min-w-36" },
  { key: "businessName", label: "Business", width: "min-w-44" },
  { key: "registrationType", label: "Registration Type", width: "min-w-48" },
  { key: "mainCategory", label: "Category", width: "min-w-44" },
  { key: "natureOfBusiness", label: "Nature", width: "min-w-44" },
  { key: "address", label: "Address", width: "min-w-64" },
  { key: "city", label: "City", width: "min-w-36" },
  { key: "state", label: "State", width: "min-w-36" },
  { key: "pinCode", label: "Pin Code", width: "min-w-32" },
  { key: "status", label: "Status", width: "min-w-36" },
  { key: "message", label: "Message", width: "min-w-64" },
  { key: "createdAt", label: "Lead Created", width: "min-w-44", format: "date" },
  { key: "copiedAt", label: "Added To Manager", width: "min-w-44", format: "date" },
];

const USER_COLUMNS = [
  { key: "sourceDatabase", label: "Source DB", width: "min-w-36" },
  { key: "name", label: "Name", width: "min-w-44" },
  { key: "email", label: "Email", width: "min-w-56" },
  { key: "phone", label: "Phone", width: "min-w-36" },
  { key: "role", label: "Role", width: "min-w-32" },
  { key: "referralCode", label: "Referral Code", width: "min-w-40" },
  { key: "referredByCode", label: "Referred By", width: "min-w-40" },
  { key: "createdAt", label: "User Created", width: "min-w-44", format: "date" },
  { key: "copiedAt", label: "Added To Manager", width: "min-w-44", format: "date" },
];

async function fetchJson(url, options) {
  const response = await fetch(url, { cache: "no-store", ...options });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
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

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return displayValue(value);
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatLeadCell(row, column) {
  const value = row[column.key];
  if (!value && ["address", "state", "pinCode", "natureOfBusiness"].includes(column.key)) {
    return displayValue(readMetadata(row.metadata)[column.key]);
  }
  if (column.format === "date") return formatDate(value);
  return displayValue(value);
}

function formatUserCell(row, column) {
  if (column.format === "date") return formatDate(row[column.key]);
  return displayValue(row[column.key]);
}

function StatusCell({ value }) {
  const label = displayValue(value) || EMPTY_TEXT;
  const isConverted = label === "CONVERTED";
  const isNew = label === "NEW";
  const className = isConverted
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900"
    : isNew
      ? "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900"
      : "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800";

  return <span className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ring-1 ${className}`}>{label}</span>;
}

function RoleCell({ value }) {
  const label = displayValue(value) || EMPTY_TEXT;
  const isAdmin = label === "ADMIN" || label === "SUPER_ADMIN";
  const className = isAdmin
    ? "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950 dark:text-purple-200 dark:ring-purple-900"
    : "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800";

  return <span className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ring-1 ${className}`}>{label}</span>;
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <p className="font-semibold text-slate-900 dark:text-white">{message}</p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function renderCell(row, col, formatFn) {
  const value = formatFn(row, col);

  if (col.key === "sourceDatabase") return <SourceDbBadge value={row.sourceDatabase} />;
  if (col.key === "status") return <StatusCell value={row.status} />;
  if (col.key === "role") return <RoleCell value={row.role} />;
  if (value) return <span className="line-clamp-2 break-words">{value}</span>;
  return <span className="text-slate-400 dark:text-slate-500">{EMPTY_TEXT}</span>;
}

export default function ManagerWorkspaceClient() {
  const [activeTab, setActiveTab] = useState("leads");

  // --- Registration Lead state ---
  const [leads, setLeads] = useState([]);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadLoading, setLeadLoading] = useState(true);
  const [leadError, setLeadError] = useState("");
  const [leadDeleting, setLeadDeleting] = useState(null);
  const [leadConfirm, setLeadConfirm] = useState(null);

  // --- User state ---
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState("");
  const [userDeleting, setUserDeleting] = useState(null);
  const [userConfirm, setUserConfirm] = useState(null);

  const [darkMode, setDarkMode] = useState(false);

  // --- Load functions ---
  const loadLeads = useCallback(async () => {
    setLeadLoading(true);
    setLeadError("");
    try {
      const data = await fetchJson("/api/manager/leads");
      setLeads(data.rows || []);
    } catch (err) {
      setLeadError(err.message);
    } finally {
      setLeadLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    setUserLoading(true);
    setUserError("");
    try {
      const data = await fetchJson("/api/manager/users");
      setUsers(data.rows || []);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserLoading(false);
    }
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // --- Delete handlers for Leads ---
  async function deleteLead(id) {
    setLeadDeleting(id);
    setLeadError("");
    try {
      const data = await fetchJson(`/api/manager/leads/${id}`, { method: "DELETE" });
      setLeads(data.rows || []);
    } catch (err) {
      setLeadError(err.message);
    } finally {
      setLeadDeleting(null);
      setLeadConfirm(null);
    }
  }

  async function deleteAllLeads() {
    setLeadDeleting("all");
    setLeadError("");
    try {
      const data = await fetchJson("/api/manager/leads", { method: "DELETE" });
      setLeads(data.rows || []);
    } catch (err) {
      setLeadError(err.message);
    } finally {
      setLeadDeleting(null);
      setLeadConfirm(null);
    }
  }

  // --- Delete handlers for Users ---
  async function deleteUser(id) {
    setUserDeleting(id);
    setUserError("");
    try {
      const data = await fetchJson(`/api/manager/users/${id}`, { method: "DELETE" });
      setUsers(data.rows || []);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserDeleting(null);
      setUserConfirm(null);
    }
  }

  async function deleteAllUsers() {
    setUserDeleting("all");
    setUserError("");
    try {
      const data = await fetchJson("/api/manager/users", { method: "DELETE" });
      setUsers(data.rows || []);
    } catch (err) {
      setUserError(err.message);
    } finally {
      setUserDeleting(null);
      setUserConfirm(null);
    }
  }

  // --- Filtered rows ---
  const filteredLeads = useMemo(() => {
    const needle = leadSearch.trim().toLowerCase();
    if (!needle) return leads;
    return leads.filter((row) => LEAD_COLUMNS.some((col) => formatLeadCell(row, col).toLowerCase().includes(needle)));
  }, [leads, leadSearch]);

  const filteredUsers = useMemo(() => {
    const needle = userSearch.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((row) => USER_COLUMNS.some((col) => formatUserCell(row, col).toLowerCase().includes(needle)));
  }, [users, userSearch]);

  // --- Excel export ---
  function exportLeads() {
    const rows = filteredLeads.map((row) => {
      const out = {};
      for (const col of LEAD_COLUMNS) out[col.key] = formatLeadCell(row, col);
      return out;
    });
    downloadCsv(
      LEAD_COLUMNS.map((c) => c.label),
      LEAD_COLUMNS.map((c) => c.key),
      rows,
      `CEO_CaLeads_RegistrationLead_${new Date().toISOString().slice(0, 10)}`
    );
  }

  function exportUsers() {
    const rows = filteredUsers.map((row) => {
      const out = {};
      for (const col of USER_COLUMNS) out[col.key] = formatUserCell(row, col);
      return out;
    });
    downloadCsv(
      USER_COLUMNS.map((c) => c.label),
      USER_COLUMNS.map((c) => c.key),
      rows,
      `CEO_CaLeads_User_${new Date().toISOString().slice(0, 10)}`
    );
  }

  const loading = activeTab === "leads" ? leadLoading : userLoading;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Confirm dialogs */}
      {leadConfirm && (
        <ConfirmDialog
          message={
            leadConfirm.type === "all"
              ? "Delete ALL registration leads from CEO_CaLeads? This cannot be undone."
              : "Delete this registration lead from CEO_CaLeads?"
          }
          onConfirm={() => leadConfirm.type === "all" ? deleteAllLeads() : deleteLead(leadConfirm.id)}
          onCancel={() => setLeadConfirm(null)}
        />
      )}
      {userConfirm && (
        <ConfirmDialog
          message={
            userConfirm.type === "all"
              ? "Delete ALL users from CEO_CaLeads? This cannot be undone."
              : "Delete this user from CEO_CaLeads?"
          }
          onConfirm={() => userConfirm.type === "all" ? deleteAllUsers() : deleteUser(userConfirm.id)}
          onCancel={() => setUserConfirm(null)}
        />
      )}

      <div className="flex">
        <Sidebar database={MANAGER_DATABASE} modeLabel="Manager DB" onRefresh={activeTab === "leads" ? loadLeads : loadUsers} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((v) => !v)} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Breadcrumb databaseName={MANAGER_DATABASE} tableName={activeTab === "leads" ? "RegistrationLead" : "User"} />
                <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                  CEO_CaLeads {activeTab === "leads" ? "RegistrationLead" : "User"}
                </h1>
                <p className="mt-1 text-sm font-semibold text-brand-700 dark:text-brand-100">{DATABASE_DISPLAY_NAMES[MANAGER_DATABASE]}</p>
              </div>
              <button
                type="button"
                onClick={activeTab === "leads" ? loadLeads : loadUsers}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
              >
                <RefreshCcw size={17} aria-hidden="true" />
                Refresh
              </button>
            </div>

            {/* Tabs */}
            <div className="mt-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab("leads")}
                className={`h-10 px-4 text-sm font-bold transition-colors ${
                  activeTab === "leads"
                    ? "border-b-2 border-brand-600 text-brand-700 dark:text-brand-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                RegistrationLead
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("users")}
                className={`h-10 px-4 text-sm font-bold transition-colors ${
                  activeTab === "users"
                    ? "border-b-2 border-brand-600 text-brand-700 dark:text-brand-300"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                User
              </button>
            </div>

            {/* Error banners */}
            {leadError && activeTab === "leads" ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <p className="font-bold">Unable to load manager leads</p>
                  <p className="mt-1 text-sm">{leadError}</p>
                </div>
              </div>
            ) : null}

            {userError && activeTab === "users" ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <p className="font-bold">Unable to load manager users</p>
                  <p className="mt-1 text-sm">{userError}</p>
                </div>
              </div>
            ) : null}

            {/* Content */}
            {loading ? (
              <div className="mt-6">
                <TableSkeleton />
              </div>
            ) : (
              <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-950 dark:text-white">
                      {activeTab === "leads" ? "Manager RegistrationLead" : "Manager User"}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activeTab === "leads"
                        ? `${filteredLeads.length.toLocaleString()} saved leads`
                        : `${filteredUsers.length.toLocaleString()} saved users`}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SearchBar
                      value={activeTab === "leads" ? leadSearch : userSearch}
                      onChange={activeTab === "leads" ? setLeadSearch : setUserSearch}
                      placeholder={activeTab === "leads" ? "Search manager leads" : "Search manager users"}
                    />
                    {/* Excel export */}
                    <button
                      type="button"
                      onClick={activeTab === "leads" ? exportLeads : exportUsers}
                      disabled={activeTab === "leads" ? filteredLeads.length === 0 : filteredUsers.length === 0}
                      title="Download visible rows as Excel/CSV"
                      className="flex h-10 shrink-0 items-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                    >
                      <FileDown size={15} aria-hidden="true" />
                      Excel
                    </button>
                    {/* Delete all */}
                    <button
                      type="button"
                      onClick={() =>
                        activeTab === "leads"
                          ? setLeadConfirm({ type: "all" })
                          : setUserConfirm({ type: "all" })
                      }
                      disabled={activeTab === "leads" ? leadDeleting !== null || leads.length === 0 : userDeleting !== null || users.length === 0}
                      className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash size={15} aria-hidden="true" />
                      Delete All
                    </button>
                  </div>
                </div>

                {/* ---- LEADS TABLE ---- */}
                {activeTab === "leads" && (
                  filteredLeads.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">No manager leads saved yet</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open valuexpert RegistrationLead and use Add to save leads here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                        <thead>
                          <tr>
                            <th className="min-w-24 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                              Actions
                            </th>
                            {LEAD_COLUMNS.map((col) => (
                              <th
                                key={col.key}
                                scope="col"
                                className={`${col.width} border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredLeads.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                              <td className="border-b border-r border-slate-100 px-3 py-3 align-top first:border-l dark:border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => setLeadConfirm({ type: "one", id: row.id })}
                                  disabled={leadDeleting !== null}
                                  className="flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete this lead"
                                >
                                  <Trash2 size={13} aria-hidden="true" />
                                  Delete
                                </button>
                              </td>
                              {LEAD_COLUMNS.map((col) => (
                                <td
                                  key={col.key}
                                  className={`${col.width} max-w-72 border-b border-r border-slate-100 px-3 py-3 align-top text-slate-700 first:border-l dark:border-slate-900 dark:text-slate-300`}
                                  title={col.key === "sourceDatabase" ? row.sourceDatabase : formatLeadCell(row, col)}
                                >
                                  {renderCell(row, col, formatLeadCell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* ---- USERS TABLE ---- */}
                {activeTab === "users" && (
                  filteredUsers.length === 0 ? (
                    <div className="p-10 text-center">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">No manager users saved yet</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Open valuexpert User table and use Add to save users here.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
                        <thead>
                          <tr>
                            <th className="min-w-24 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                              Actions
                            </th>
                            {USER_COLUMNS.map((col) => (
                              <th
                                key={col.key}
                                scope="col"
                                className={`${col.width} border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200`}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((row, rowIndex) => (
                            <tr key={row.id || rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                              <td className="border-b border-r border-slate-100 px-3 py-3 align-top first:border-l dark:border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => setUserConfirm({ type: "one", id: row.id })}
                                  disabled={userDeleting !== null}
                                  className="flex h-9 items-center gap-1.5 rounded-lg bg-red-600 px-3 text-xs font-bold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                  title="Delete this user"
                                >
                                  <Trash2 size={13} aria-hidden="true" />
                                  Delete
                                </button>
                              </td>
                              {USER_COLUMNS.map((col) => (
                                <td
                                  key={col.key}
                                  className={`${col.width} max-w-72 border-b border-r border-slate-100 px-3 py-3 align-top text-slate-700 first:border-l dark:border-slate-900 dark:text-slate-300`}
                                  title={col.key === "sourceDatabase" ? row.sourceDatabase : formatUserCell(row, col)}
                                >
                                  {renderCell(row, col, formatUserCell)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
