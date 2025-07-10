import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AuditLogEntry {
  id: number;
  listing_id: number;
  action: string;
  admin: string;
  timestamp: string;
}

export interface AuditLogTableProps {
  logs: AuditLogEntry[];
}

export default function AuditLogTable({ logs }: Readonly<AuditLogTableProps>) {
  return (
    <div className="max-w-4xl mx-auto py-8 px-2 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-bold mb-4">Audit Trail</h2>
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow>
            <TableHead>Listing ID</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No audit log entries.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>{log.listing_id}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.admin}</TableCell>
                <TableCell>{log.timestamp}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
