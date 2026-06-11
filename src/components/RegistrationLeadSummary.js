"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Database, FileDown } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import { downloadCsv } from "@/utils/exportCsv";

const PAGE_SIZE = 10;
const EMPTY_TEXT = "Not provided";

const LEAD_COLUMNS = [
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
  { key: "createdAt", label: "Created", width: "min-w-44", format: "date" },
];

const EXPORT_COLUMNS = [
  ...LEAD_COLUMNS,
  { key: "sourcePageSlug", label: "Source Page" },
  { key: "formType", label: "Form Type" },
  { key: "source", label: "Source" },
  { key: "userId", label: "User ID" },
  { key: "id", label: "Lead ID" },
];

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

function formatCell(row, column) {
  const value = row[column.key];
  if (!value && ["address", "state", "pinCode", "natureOfBusiness"].includes(column.key)) {
    return displayValue(readMetadata(row.metadata)[column.key]);
  }
  if (column.format === "date") return formatDate(row[column.key]);
  return displayValue(value);
}

function formatExportCell(row, column) {
  const value = row[column.key];
  if (!value && ["address", "state", "pinCode", "natureOfBusiness"].includes(column.key)) {
    return displayValue(readMetadata(row.metadata)[column.key]);
  }
  if (column.format === "date") return formatDate(value);
  return displayValue(value);
}

function StatusCell({ value }) {
  const label = displayValue(value) || EMPTY_TEXT;
  const isNew = label === "NEW";
  const isConverted = label === "CONVERTED";
  const className = isConverted
    ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-200 dark:ring-emerald-900"
    : isNew
      ? "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-200 dark:ring-sky-900"
      : "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800";

  return <span className={`inline-flex h-7 items-center rounded-md px-2 text-xs font-bold ring-1 ${className}`}>{label}</span>;
}

/**
 * @param {{ rows: object[], sourceDatabase?: string }} props
 * sourceDatabase — which DB these rows come from (default "valuexpert")
 */
export default function RegistrationLeadSummary({ rows, sourceDatabase = "valuexpert" }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows || [];

    return (rows || []).filter((row) =>
      LEAD_COLUMNS.some((column) => formatCell(row, column).toLowerCase().includes(needle))
    );
  }, [rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(nextValue) {
    setSearch(nextValue);
    setPage(1);
  }

  async function copyLeadIds(leadIds) {
    if (leadIds.length === 0) return;
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/manager/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds, sourceDatabase }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to copy leads");

      setSavedIds(new Set(leadIds));
      setMessage(`${data.copied} lead${data.copied === 1 ? "" : "s"} added to CEO_CaLeads from ${sourceDatabase}.`);
      window.setTimeout(() => setSavedIds(new Set()), 1800);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    const exportRows = filteredRows.map((row) => {
      const out = {};
      for (const col of EXPORT_COLUMNS) {
        out[col.key] = formatExportCell(row, col);
      }
      return out;
    });
    downloadCsv(
      EXPORT_COLUMNS.map((c) => c.label),
      EXPORT_COLUMNS.map((c) => c.key),
      exportRows,
      `${sourceDatabase}_RegistrationLead_${new Date().toISOString().slice(0, 10)}`
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Registration Lead Info</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filteredRows.length.toLocaleString()} displayed matches</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:items-center">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search registration leads" />
          <button
            type="button"
            onClick={handleExport}
            disabled={filteredRows.length === 0}
            title="Download as Excel/CSV"
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
          >
            <FileDown size={17} aria-hidden="true" />
            Excel
          </button>
          <button
            type="button"
            onClick={() => copyLeadIds(filteredRows.map((row) => row.id))}
            disabled={saving || filteredRows.length === 0}
            className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Database size={17} aria-hidden="true" />
            Add visible
          </button>
        </div>
      </div>

      {message ? (
        <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
          {error}
        </div>
      ) : null}

      {visibleRows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold text-slate-800 dark:text-slate-200">No registration leads found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="min-w-36 border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    Manager
                  </th>
                  {LEAD_COLUMNS.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className={`${column.width} border-b border-r border-slate-200 bg-slate-50 px-3 py-3 font-bold text-slate-700 first:border-l dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200`}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row, rowIndex) => (
                  <tr key={row.id || rowIndex} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    <td className="border-b border-r border-slate-100 px-3 py-3 align-top first:border-l dark:border-slate-900">
                      <button
                        type="button"
                        onClick={() => copyLeadIds([row.id])}
                        disabled={saving}
                        className={`flex h-9 items-center gap-2 rounded-lg px-3 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50 ${
                          savedIds.has(row.id) ? "bg-emerald-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700"
                        }`}
                      >
                        {savedIds.has(row.id) ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
                        {savedIds.has(row.id) ? "Added" : "Add"}
                      </button>
                    </td>
                    {LEAD_COLUMNS.map((column) => {
                      const value = formatCell(row, column);

                      return (
                        <td
                          key={column.key}
                          className={`${column.width} max-w-72 border-b border-r border-slate-100 px-3 py-3 align-top text-slate-700 first:border-l dark:border-slate-900 dark:text-slate-300`}
                          title={value}
                        >
                          {column.key === "status" ? (
                            <StatusCell value={row.status} />
                          ) : value ? (
                            <span className="line-clamp-2 break-words">{value}</span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500">{EMPTY_TEXT}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Page {safePage} of {pageCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={safePage === pageCount}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-200"
                aria-label="Next page"
              >
                <ChevronRight size={17} aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
