import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

// GET /api/listings/[id]
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const listing = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.id);
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

// PUT or PATCH /api/listings/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const data = await req.json();
  const { title, description, status } = data;
  const listing = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.id) as
    | { title: string; description: string; status: string }
    | undefined;
  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  const update = db.prepare(
    "UPDATE listings SET title = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
  );
  update.run(
    title ?? listing.title,
    description ?? listing.description,
    status ?? listing.status,
    params.id
  );
  // Audit log: determine action type
  let action = "edit";
  if (status && status !== listing.status) {
    if (status === "approved") action = "approve";
    else if (status === "rejected") action = "reject";
    else if (status === "pending") action = "pending";
  }
  db.prepare(
    "INSERT INTO audit_log (listing_id, action, admin) VALUES (?, ?, ?)"
  ).run(params.id, action, "admin");
  const updated = db
    .prepare("SELECT * FROM listings WHERE id = ?")
    .get(params.id);
  return NextResponse.json({ listing: updated });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PUT(req, context);
}

// (Optional) DELETE /api/listings/[id]
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  const info = db.prepare("DELETE FROM listings WHERE id = ?").run(params.id);
  if (info.changes === 0) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
