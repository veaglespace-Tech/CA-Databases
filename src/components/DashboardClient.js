"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DatabaseCard from "@/components/DatabaseCard";
import TableCard from "@/components/TableCard";
import SearchBar from "@/components/SearchBar";
import Breadcrumb from "@/components/Breadcrumb";
import { CardSkeleton } from "@/components/Skeletons";
import { DATABASE_DISPLAY_NAMES, MANAGER_TABLES } from "@/config/databases";

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export default function DashboardClient({ showTables = false }) {
  const [database, setDatabase] = useState(null);
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [showAllTables, setShowAllTables] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [databaseData, tableData] = await Promise.all([
        fetchJson("/api/database"),
        showTables ? fetchJson("/api/tables") : Promise.resolve([]),
      ]);
      setDatabase(databaseData);
      setTables(tableData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [showTables]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredTables = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return tables;
    return tables.filter((table) => table.name.toLowerCase().includes(needle));
  }, [search, tables]);

  const managerTables = useMemo(
    () => MANAGER_TABLES.map((tableName) => tables.find((table) => table.name === tableName)).filter(Boolean),
    [tables]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex">
        <Sidebar database={database?.database} onRefresh={loadData} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Breadcrumb databaseName={showTables ? "valuexpert" : undefined} />
                <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                  {showTables ? "valuexpert Tables" : "Databases"}
                </h1>
                {showTables ? (
                  <p className="mt-1 text-base font-semibold text-brand-700 dark:text-brand-100">
                    {DATABASE_DISPLAY_NAMES.valuexpert}
                  </p>
                ) : null}
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Last refresh: {database?.lastRefresh ? new Date(database.lastRefresh).toLocaleString() : "Not loaded"}
                </p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 text-sm font-bold text-white hover:bg-brand-700"
              >
                <RefreshCcw size={17} aria-hidden="true" />
                Refresh
              </button>
            </div>

            {error ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-100">
                <AlertTriangle size={20} aria-hidden="true" />
                <div>
                  <p className="font-bold">Unable to load dashboard</p>
                  <p className="mt-1 text-sm">{error}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-3">
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              ) : (
                <DatabaseCard database={database} href={showTables ? undefined : "/database/valuexpert"} />
              )}
            </div>

            {showTables ? (
            <section className="mt-8">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white">Main Tables</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manager focus: User and RegistrationLead.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAllTables((value) => !value)}
                  className="flex h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  {showAllTables ? "Hide all tables" : "Show all tables"}
                </button>
              </div>

              {loading ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 2 }).map((_, index) => (
                    <CardSkeleton key={index} />
                  ))}
                </div>
              ) : managerTables.length ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {managerTables.map((table) => (
                    <TableCard key={table.name} table={table} />
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <p className="font-bold text-slate-900 dark:text-white">No tables found</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try refreshing or changing the table search.</p>
                </div>
              )}

              {showAllTables ? (
                <div className="mt-8">
                  <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-950 dark:text-white">All Tables</h2>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Full read-only list from valuexpert.</p>
                    </div>
                    <div className="w-full md:max-w-sm">
                      <SearchBar value={search} onChange={setSearch} placeholder="Search all tables" />
                    </div>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTables.map((table) => (
                      <TableCard key={table.name} table={table} />
                    ))}
                  </div>
                </div>
              ) : null}
            </section>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  );
}
