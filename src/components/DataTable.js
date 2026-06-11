"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SearchBar from "@/components/SearchBar";

const PAGE_SIZE = 10;

function stringifyCell(value) {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function DataTable({ columns, rows }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;

    return rows.filter((row) =>
      columns.some((column) => stringifyCell(row[column.name]).toLowerCase().includes(needle))
    );
  }, [columns, rows, search]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(nextValue) {
    setSearch(nextValue);
    setPage(1);
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950 dark:text-white">First 100 Rows</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filteredRows.length.toLocaleString()} displayed matches</p>
        </div>
        <div className="w-full md:max-w-sm">
          <SearchBar value={search} onChange={handleSearch} placeholder="Search displayed rows" />
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold text-slate-800 dark:text-slate-200">No rows found</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This table is currently empty.</p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-semibold text-slate-800 dark:text-slate-200">No matching rows</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try a different search term.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  {columns.map((column) => (
                    <th key={column.name} scope="col" className="whitespace-nowrap px-4 py-3 font-bold text-slate-700 dark:text-slate-200">
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {visibleRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-900/70">
                    {columns.map((column) => (
                      <td key={column.name} className="max-w-72 truncate px-4 py-3 text-slate-700 dark:text-slate-300" title={stringifyCell(row[column.name])}>
                        {stringifyCell(row[column.name]) || <span className="text-slate-400">NULL</span>}
                      </td>
                    ))}
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
