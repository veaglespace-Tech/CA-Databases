import TableDetailsClient from "@/components/TableDetailsClient";

export default async function DatabaseTablePage({ params }) {
  const { databaseName, tableName } = await params;
  return <TableDetailsClient databaseName={databaseName} tableName={tableName} />;
}
