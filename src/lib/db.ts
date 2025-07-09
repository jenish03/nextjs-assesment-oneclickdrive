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
    insert.run("Chevrolet Camaro", "A modern muscle car.", "pending");
    insert.run("Tesla Model 3", "Electric and fast.", "pending");
    insert.run("BMW 3 Series", "Luxury and performance.", "pending");
    insert.run("Audi A4", "German engineering.", "pending");
    insert.run("Mercedes-Benz C-Class", "Premium comfort.", "pending");
    insert.run("Volkswagen Golf", "Compact and practical.", "pending");
    insert.run("Hyundai Elantra", "Affordable and efficient.", "pending");
    insert.run("Kia Optima", "Value and style.", "pending");
    insert.run("Nissan Altima", "Smooth ride.", "pending");
    insert.run("Subaru Impreza", "All-wheel drive.", "pending");
    insert.run("Mazda 3", "Fun to drive.", "pending");
    insert.run("Dodge Charger", "Powerful sedan.", "pending");
    insert.run("Jeep Wrangler", "Off-road icon.", "pending");
    insert.run("Toyota Prius", "Hybrid efficiency.", "pending");
    insert.run("Honda Accord", "Spacious and reliable.", "pending");
    insert.run("Ford F-150", "Best-selling truck.", "pending");
    insert.run("Chevrolet Silverado", "Strong and capable.", "pending");
    insert.run("Ram 1500", "Comfortable pickup.", "pending");
    insert.run("Porsche 911", "Iconic sports car.", "pending");
    insert.run("Lexus RX", "Luxury SUV.", "pending");
    insert.run("Acura MDX", "Premium crossover.", "pending");
    insert.run("Infiniti Q50", "Sporty luxury sedan.", "pending");
    insert.run("Cadillac Escalade", "Full-size luxury SUV.", "pending");
    insert.run("GMC Sierra", "Professional grade truck.", "pending");
    insert.run("Buick Enclave", "Spacious and quiet.", "pending");
    insert.run("Chrysler Pacifica", "Family minivan.", "pending");
    insert.run("Mini Cooper", "Compact and fun.", "pending");
    insert.run("Volvo XC90", "Swedish luxury SUV.", "pending");
    insert.run("Land Rover Discovery", "Off-road luxury.", "pending");
    insert.run("Jaguar XF", "British elegance.", "pending");
    insert.run("Alfa Romeo Giulia", "Italian performance.", "pending");
    insert.run("Fiat 500", "City car.", "pending");
    insert.run("Mitsubishi Outlander", "Versatile SUV.", "pending");
    insert.run("Suzuki Swift", "Agile hatchback.", "pending");
    insert.run("Peugeot 3008", "French crossover.", "pending");
    insert.run("Renault Clio", "Popular European hatchback.", "pending");
    insert.run("Citroën C3", "Comfortable city car.", "pending");
    insert.run("Skoda Octavia", "Spacious and efficient.", "pending");
    insert.run("Seat Leon", "Spanish hatchback.", "pending");
    insert.run("Opel Astra", "Reliable compact.", "pending");
    insert.run("Saab 9-3", "Swedish classic.", "pending");
    insert.run("Dacia Duster", "Affordable SUV.", "pending");
    insert.run("Tesla Model S", "Luxury electric sedan.", "pending");
    insert.run("Lucid Air", "High-end electric.", "pending");
    insert.run("Rivian R1T", "Electric adventure truck.", "pending");
    insert.run("Polestar 2", "Performance EV.", "pending");
    insert.run("BYD Han", "Chinese electric sedan.", "pending");
    insert.run("Geely Emgrand", "Popular in Asia.", "pending");
    insert.run("Great Wall Haval H6", "Chinese SUV.", "pending");
    insert.run("Tata Nexon", "Indian compact SUV.", "pending");
    insert.run("Mahindra XUV700", "Indian family SUV.", "pending");
    insert.run("Proton X70", "Malaysian SUV.", "pending");
    insert.run("Perodua Myvi", "Malaysian hatchback.", "pending");
    insert.run("Holden Commodore", "Australian classic.", "pending");
    insert.run("UAZ Patriot", "Russian off-roader.", "pending");
    insert.run("Lada Niva", "Russian 4x4.", "pending");
    insert.run("SsangYong Tivoli", "Korean compact SUV.", "pending");
  }
}
seedListings();

export default db;
