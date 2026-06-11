import DashboardClient from "@/components/DashboardClient";
import ManagerWorkspaceClient from "@/components/ManagerWorkspaceClient";
import { MANAGER_DATABASE } from "@/config/databases";

export default async function DatabasePage({ params }) {
  const { databaseName } = await params;

  if (databaseName === MANAGER_DATABASE) {
    return <ManagerWorkspaceClient />;
  }

  if (typeof databaseName !== "string" || !databaseName.toLowerCase().includes("valuexpert")) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
        <section className="max-w-md rounded-lg border border-red-200 bg-white p-6 shadow-soft dark:border-red-900 dark:bg-slate-950">
          <h1 className="text-xl font-bold">Forbidden database</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Only databases that contain valuexpert in the name are allowed.</p>
        </section>
      </main>
    );
  }

  return <DashboardClient databaseName={databaseName} />;
}
