import Link from "next/link";
import { ArrowRight, Table2 } from "lucide-react";

export default function TableCard({ table, databaseName = "valuexpert" }) {
  return (
    <Link
      href={`/database/${encodeURIComponent(databaseName)}/table/${encodeURIComponent(table.name)}`}
      className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-soft dark:border-slate-800 dark:bg-slate-950 dark:hover:border-brand-500"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
            <Table2 size={19} aria-hidden="true" />
          </div>
          <h2 className="mt-4 truncate text-lg font-bold text-slate-950 dark:text-white" title={table.name}>
            {table.name}
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{table.rowCount.toLocaleString()} rows</p>
        </div>
        <ArrowRight size={18} className="mt-1 text-slate-400 transition group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
      </div>
    </Link>
  );
}
