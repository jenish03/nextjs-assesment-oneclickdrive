import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/listings
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const status = searchParams.get("status");

  let where = "";
  const params: string[] = [];
  if (status) {
    where = "WHERE status = ?";
    params.push(status);
  }

  const totalRow = db
    .prepare(`SELECT COUNT(*) as count FROM listings ${where}`)
    .get(...params);
  const total = (totalRow as { count: number }).count;
  const offset = (page - 1) * pageSize;
  const listings = db
    .prepare(`SELECT * FROM listings ${where} ORDER BY id ASC LIMIT ? OFFSET ?`)
    .all(...params, pageSize, offset);

  return NextResponse.json({ listings, total, page, pageSize });
}

// POST /api/listings (optional, for completeness)
export async function POST(req: NextRequest) {
  const data = await req.json();
  const { title, description, status = "pending" } = data;
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  const stmt = db.prepare(
    "INSERT INTO listings (title, description, status) VALUES (?, ?, ?)"
  );
  const info = stmt.run(title, description, status);
  const listing = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(info.lastInsertRowid);
  return NextResponse.json({ listing });
}
