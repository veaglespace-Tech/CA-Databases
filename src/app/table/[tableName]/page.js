import TableDetailsClient from "@/components/TableDetailsClient";

export default async function TablePage({ params }) {
  const { tableName } = await params;
  return <TableDetailsClient tableName={tableName} />;
}
