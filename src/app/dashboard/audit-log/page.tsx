import AuditLogTable, { AuditLogEntry } from "./AuditLogTable";

export default async function AuditLogPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/audit-log`, { cache: "no-store" });
  if (!res.ok) {
    return <div className="text-red-600">Failed to load audit log.</div>;
  }
  const data = await res.json();
  const logs: AuditLogEntry[] = data.logs || [];
  return <AuditLogTable logs={logs} />;
}
