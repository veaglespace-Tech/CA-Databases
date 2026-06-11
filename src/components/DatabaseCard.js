import Link from "next/link";
import { ArrowRight, Database, Rows3, Table2 } from "lucide-react";
import { DATABASE_DISPLAY_NAMES } from "@/config/databases";

export default function DatabaseCard({ database, href }) {
  const databaseName = database?.database || "valuexpert";
  const stats = [
    { label: "Database", value: DATABASE_DISPLAY_NAMES[databaseName] || databaseName, icon: Database },
    { label: "Tables", value: database?.tableCount ?? 0, icon: Table2 },
    { label: "Total Rows", value: database?.totalRows?.toLocaleString() ?? "0", icon: Rows3 },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const content = (
          <>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 break-all text-2xl font-bold text-slate-950 dark:text-white">{stat.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700 dark:bg-slate-900 dark:text-brand-100">
                <Icon size={21} aria-hidden="true" />
              </div>
            </div>
            {href && stat.label === "Database" ? (
              <div className="mt-5 flex items-center gap-2 text-sm font-bold text-brand-700 dark:text-brand-100">
                Open tables
                <ArrowRight size={16} aria-hidden="true" />
              </div>
            ) : null}
          </>
        );

        if (href && stat.label === "Database") {
          return (
            <Link key={stat.label} href={href} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-500 dark:border-slate-800 dark:bg-slate-950">
              {content}
            </Link>
          );
        }

        return (
          <section key={stat.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950">
            {content}
          </section>
        );
      })}
    </div>
  );
}
