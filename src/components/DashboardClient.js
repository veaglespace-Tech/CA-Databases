"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import DatabaseCard from "@/components/DatabaseCard";
import TableCard from "@/components/TableCard";
import SearchBar from "@/components/SearchBar";
import Breadcrumb from "@/components/Breadcrumb";
import { CardSkeleton } from "@/components/Skeletons";

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

function matchesSearch(value, needle) {
  if (!needle) return true;
  return value.toLowerCase().includes(needle);
}

export default function DashboardClient({ databaseName = null }) {
  const [databases, setDatabases] = useState([]);
  const [database, setDatabase] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (databaseName) {
        const [databasesData, databaseData] = await Promise.all([
          fetchJson("/api/databases"),
          fetchJson(`/api/databases/${encodeURIComponent(databaseName)}`),
        ]);
        setDatabases(databasesData.databases || []);
        setDatabase(databaseData);
        setLastRefresh(databaseData.lastRefresh || databasesData.lastRefresh || null);
      } else {
        const data = await fetchJson("/api/databases");
        setDatabases(data.databases || []);
        setDatabase(null);
        setLastRefresh(data.lastRefresh || null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [databaseName]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const databaseNames = useMemo(() => databases.map((item) => item.database), [databases]);

  const visibleDatabases = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return databases;
    return databases.filter(
      (item) =>
        matchesSearch(item.database, needle) ||
        item.tables?.some((table) => matchesSearch(table.name, needle))
    );
  }, [databases, search]);

  const visibleTables = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!database) return [];
    if (!needle) return database.tables || [];
    return (database.tables || []).filter((table) => matchesSearch(table.name, needle));
  }, [database, search]);

  const activeDatabase = databaseName || "overview";
  const isOverview = !databaseName;
  const sidebarDatabaseNames = databaseNames;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="flex">
        <Sidebar
          database={activeDatabase}
          databaseNames={sidebarDatabaseNames}
          onRefresh={loadData}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((value) => !value)}
        />
        <main className="min-w-0 flex-1 px-4 py-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Breadcrumb databaseName={databaseName || undefined} />
                <h1 className="mt-3 text-3xl font-bold text-slate-950 dark:text-white">
                  {isOverview ? "valuexpert Databases" : `${databaseName} Tables`}
                </h1>
                <p className="mt-1 text-base font-semibold text-brand-700 dark:text-brand-100">
                  {isOverview
                    ? "All databases that contain valuexpert in their name, grouped with their tables."
                    : `Read-only tables for ${databaseName}.`}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Last refresh: {lastRefresh ? new Date(lastRefresh).toLocaleString() : "Not loaded"}
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

            <div className="mt-6">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder={isOverview ? "Search databases or tables" : "Search tables"}
              />
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

            {loading ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : isOverview ? (
              visibleDatabases.length ? (
                <div className="mt-6 space-y-8">
                  {visibleDatabases.map((item) => (
                    <section key={item.database} className="space-y-4">
                      <DatabaseCard database={item} href={`/database/${encodeURIComponent(item.database)}`} />
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {item.tables
                          .filter((table) => {
                            const needle = search.trim().toLowerCase();
                            return !needle || matchesSearch(table.name, needle) || matchesSearch(item.database, needle);
                          })
                          .map((table) => (
                            <TableCard key={`${item.database}-${table.name}`} table={table} databaseName={item.database} />
                          ))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <p className="font-bold text-slate-900 dark:text-white">No matching databases found</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Try refreshing or widening the search.
                  </p>
                </div>
              )
            ) : (
              <>
                <div className="mt-6">
                  <DatabaseCard database={database} />
                </div>

                {visibleTables.length ? (
                  <div className="mt-8">
                    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-950 dark:text-white">All Tables</h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          Read-only table list for {databaseName}.
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visibleTables.map((table) => (
                        <TableCard key={table.name} table={table} databaseName={databaseName} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-8 rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-950">
                    <p className="font-bold text-slate-900 dark:text-white">No tables found</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Try refreshing or changing the table search.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
