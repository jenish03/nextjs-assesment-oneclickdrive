import { NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/audit-log
export async function GET() {
  const logs = db
    .prepare("SELECT * FROM audit_log ORDER BY timestamp DESC")
    .all();
  return NextResponse.json({ logs });
}
