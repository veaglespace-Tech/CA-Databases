"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Breadcrumb from "@/components/Breadcrumb";
import DataTable from "@/components/DataTable";
import RegistrationLeadSummary from "@/components/RegistrationLeadSummary";
import UserSummary from "@/components/UserSummary";
import { TableSkeleton } from "@/components/Skeletons";

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

const REGISTRATION_LEAD_COLUMN_ORDER = [
  "fullName",
  "email",
  "phone",
  "address",
  "city",
  "state",
  "pinCode",
  "businessName",
  "natureOfBusiness",
  "registrationType",
  "mainCategory",
  "status",
  "message",
  "createdAt",
  "sourcePageSlug",
  "formType",
  "source",
  "userId",
  "assignedToId",
  "serviceId",
  "id",
  "updatedAt",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "ipAddress",
  "metadata",
  "userAgent",
];

function orderColumns(tableName, columns = []) {
  if (tableName !== "RegistrationLead") return columns;

  const priority = new Map(REGISTRATION_LEAD_COLUMN_ORDER.map((columnName, index) => [columnName, index]));
  return [...columns].sort((first, second) => {
    const firstIndex = priority.has(first.name) ? priority.get(first.name) : Number.MAX_SAFE_INTEGER;
    const secondIndex = priority.has(second.name) ? priority.get(second.name) : Number.MAX_SAFE_INTEGER;
    if (firstIndex !== secondIndex) return firstIndex - secondIndex;
    return columns.findIndex((column) => column.name === first.name) - columns.findIndex((column) => column.name === second.name);
  });
}

export default function TableDetailsClient({ tableName }) {
  const [table, setTable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const isRegistrationLead = tableName === "RegistrationLead";
  const isUser = tableName === "User";

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchJson(`/api/tables/${encodeURIComponent(tableName)}`);
      setTable(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [tableName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex">
        <Sidebar database="valuexpert" onRefresh={loadData} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <Breadcrumb databaseName="valuexpert" tableName={tableName} />
                <h1 className="mt-3 break-all text-3xl font-bold text-slate-950 dark:text-white">{tableName}</h1>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {table?.totalRecords?.toLocaleString() ?? 0} total records{isRegistrationLead || isUser ? "" : ` · ${table?.columns?.length ?? 0} columns`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/"
                  className="flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <ArrowLeft size={17} aria-hidden="true" />
                  Back
                </Link>
                <button
                  type="button"
                  onClick={loadData}
                  className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
                >
                  <RefreshCcw size={17} aria-hidden="true" />
                  Refresh
                </button>
              </div>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <p className="font-bold">Unable to load table</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="mt-6">
                <TableSkeleton />
              </div>
            ) : table ? (
              <div className="mt-6 space-y-6">
                {isRegistrationLead ? (
                  <RegistrationLeadSummary rows={table.rows} sourceDatabase="valuexpert" />
                ) : isUser ? (
                  <UserSummary rows={table.rows} sourceDatabase="valuexpert" />
                ) : (
                  <>
                    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                      <h2 className="text-base font-bold text-slate-950 dark:text-white">Columns</h2>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {orderColumns(table.tableName, table.columns).map((column) => (
                          <span key={column.name} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                            {column.name}
                            <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">{column.type}</span>
                          </span>
                        ))}
                      </div>
                    </section>
                    <DataTable columns={orderColumns(table.tableName, table.columns)} rows={table.rows} />
                  </>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
