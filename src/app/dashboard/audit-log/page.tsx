import AuditLogTable, { AuditLogEntry } from "./AuditLogTable";
import axios from "axios";

export default async function AuditLogPage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await axios.get(`${baseUrl}/api/audit-log`);
  const data = res.data as { logs?: AuditLogEntry[] };
  const logs: AuditLogEntry[] = data.logs || [];

  return <AuditLogTable logs={logs} />;
}
