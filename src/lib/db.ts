import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, "database.sqlite");
const db = new Database(dbPath);

// Create listings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// (Optional) Create audit_log table for stretch goal
db.exec(`
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    listing_id INTEGER,
    action TEXT,
    admin TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(listing_id) REFERENCES listings(id)
  );
`);

// Seed function (run only if table is empty)
function seedListings() {
  const countRow = db.prepare("SELECT COUNT(*) as count FROM listings").get();
  const count = (countRow as { count: number }).count;
  if (count === 0) {
    const insert = db.prepare(
      "INSERT INTO listings (title, description, status) VALUES (?, ?, ?)"
    );
    insert.run("Toyota Corolla", "A reliable sedan.", "pending");
    insert.run("Honda Civic", "Sporty and efficient.", "pending");
    insert.run("Ford Mustang", "Classic American muscle.", "pending");
  }
}
seedListings();

export default db;
