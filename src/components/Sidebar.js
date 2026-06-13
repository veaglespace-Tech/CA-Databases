"use client";

import Link from "next/link";
import { Database, Home, LogOut, Moon, RefreshCcw, Sun, Table2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DATABASE_DISPLAY_NAMES, MANAGER_DATABASE } from "@/config/databases";

export default function Sidebar({
  database,
  databaseNames = [],
  modeLabel = "Read Only",
  onRefresh,
  darkMode,
  onToggleDarkMode,
}) {
  const activeDatabase = database || "overview";
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => { if (data.authenticated) setCurrentUser(data.user); })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:block">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Database size={22} aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-100">{modeLabel}</p>
          <h1 className="text-lg font-bold text-slate-950 dark:text-white">DB Dashboard</h1>
        </div>
      </div>

      <nav className="mt-9 space-y-2">
        <Link
          href="/"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
            activeDatabase === "overview"
              ? "bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-white"
              : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
          }`}
        >
          <Home size={18} aria-hidden="true" />
          Overview
        </Link>
      </nav>

      <div className="mt-8 rounded-lg border border-slate-200 bg-panel p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Databases</p>
        <div className="mt-3 space-y-2">
          {databaseNames.length ? (
            databaseNames.map((databaseName) => (
              <Link
                key={databaseName}
                href={`/database/${encodeURIComponent(databaseName)}`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  activeDatabase === databaseName
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                    : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-950"
                }`}
              >
                <Table2 size={17} aria-hidden="true" />
                {DATABASE_DISPLAY_NAMES[databaseName] || databaseName}
              </Link>
            ))
          ) : (
            <Link
              href="/database/valuexpert"
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                activeDatabase === "valuexpert"
                  ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                  : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-950"
              }`}
            >
              <Table2 size={17} aria-hidden="true" />
              valuexpert
            </Link>
          )}
          <Link
            href="/manager"
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
              activeDatabase === MANAGER_DATABASE
                ? "bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white"
                : "text-slate-700 hover:bg-white dark:text-slate-200 dark:hover:bg-slate-950"
            }`}
          >
            <Table2 size={17} aria-hidden="true" />
            {MANAGER_DATABASE}
          </Link>
        </div>
        <p className="mt-4 break-all text-sm font-bold text-slate-950 dark:text-white">{DATABASE_DISPLAY_NAMES[activeDatabase] || activeDatabase}</p>
      </div>

      {/* User info + logout */}
      {currentUser && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                {currentUser.username[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{currentUser.username}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="ml-2 flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-5 right-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <RefreshCcw size={16} aria-hidden="true" />
          Refresh
        </button>
        <button
          type="button"
          onClick={onToggleDarkMode}
          className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {darkMode ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          Theme
        </button>
      </div>
    </aside>
  );
}
