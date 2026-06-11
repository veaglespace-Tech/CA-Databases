import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export default function Breadcrumb({ databaseName, tableName }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
      <Link href="/" className="flex items-center gap-1 font-medium hover:text-brand-700 dark:hover:text-brand-100">
        <Home size={15} aria-hidden="true" />
        Dashboard
      </Link>
      {databaseName ? (
        <>
          <ChevronRight size={15} aria-hidden="true" />
          <Link href={`/database/${encodeURIComponent(databaseName)}`} className="break-all font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-200 dark:hover:text-brand-100">
            {databaseName}
          </Link>
        </>
      ) : null}
      {tableName ? (
        <>
          <ChevronRight size={15} aria-hidden="true" />
          <span className="break-all font-semibold text-slate-800 dark:text-slate-200">{tableName}</span>
        </>
      ) : null}
    </nav>
  );
}
