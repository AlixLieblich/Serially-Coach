import fs from 'fs';
import { parse } from 'csv-parse/sync';
import postgres from 'postgres';
import 'dotenv/config';

/**
 * NOTE: This seed script runs slowly due to the way it interacts with the database.
 *
 * Each row in the CSV results in multiple sequential database queries:
 * - inserting/upserting a style
 * - inserting or fetching each color
 * - inserting entries into the style_colors join table
 *
 * Because these operations are executed one-by-one (not in bulk or parallel),
 * the script performs thousands of individual network round-trips to the database.
 *
 * The latency is therefore dominated by network + database response time rather than CPU usage.
 * This is expected behavior for this initial version of the seed pipeline.
 *
 * Future optimization could include batching inserts and caching color lookups
 * to significantly reduce query volume.
 * Seeded on May 28, 2026.
 */

console.log("🚀 Starting seed script...");
console.log("DB URL exists:", !!process.env.POSTGRES_URL);

// ❗ Fail fast if env is missing
if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL is missing from environment variables");
}

// Neon-friendly SSL config
const sql = postgres(process.env.POSTGRES_URL, {
  ssl: { rejectUnauthorized: false }
});

// CSV row type
type StyleCsvRow = {
  'No.': string;
  Name: string;
  Category: string;
  'Years in Prod.': string;
  Colors: string;
};

const file = fs.readFileSync('./data/styles.csv', 'utf-8');

const records: StyleCsvRow[] = parse(file, {
  columns: true,
  skip_empty_lines: true,
}) as StyleCsvRow[];

async function seedStyles() {
  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS styles (
      id SERIAL PRIMARY KEY,
      style_number TEXT UNIQUE NOT NULL,
      style_name TEXT,
      category TEXT,
      production_start INTEGER,
      production_end INTEGER,
      notes TEXT
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS colors (
      id SERIAL PRIMARY KEY,
      name TEXT UNIQUE NOT NULL
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS style_colors (
      style_id INTEGER NOT NULL REFERENCES styles(id) ON DELETE CASCADE,
      color_id INTEGER NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
      PRIMARY KEY (style_id, color_id)
    );
  `;

  console.log(`📦 Processing ${records.length} styles...`);

  for (const row of records) {
    // Parse years safely
    const years = row['Years in Prod.']
      .split(',')
      .map(y => parseInt(y.trim(), 10))
      .filter(y => !isNaN(y));

    const production_start = years.length ? Math.min(...years) : null;
    const production_end = years.length ? Math.max(...years) : null;

    // Insert / update style
    const insertedStyle = await sql`
      INSERT INTO styles (
        style_number,
        style_name,
        category,
        production_start,
        production_end,
        notes
      )
      VALUES (
        ${row['No.']},
        ${row.Name},
        ${row.Category},
        ${production_start},
        ${production_end},
        ${row.Colors}
      )
      ON CONFLICT (style_number)
      DO UPDATE SET
        style_name = EXCLUDED.style_name,
        category = EXCLUDED.category,
        production_start = EXCLUDED.production_start,
        production_end = EXCLUDED.production_end,
        notes = EXCLUDED.notes
      RETURNING id
    `;

    const styleId = insertedStyle[0].id;

    // Colors
    const colors = row.Colors
      .split(',')
      .map(c => c.trim())
      .filter(Boolean);

    for (const colorName of colors) {
      if (!colorName) continue;

      // Insert color safely
      const insertedColor = await sql`
        INSERT INTO colors (name)
        VALUES (${colorName})
        ON CONFLICT (name)
        DO UPDATE SET name = EXCLUDED.name
        RETURNING id
      `;

      const colorId = insertedColor[0].id;

      // Link table
      await sql`
        INSERT INTO style_colors (style_id, color_id)
        VALUES (${styleId}, ${colorId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  console.log(`✅ Successfully seeded ${records.length} styles`);
}

// Run
seedStyles()
  .catch((err) => {
    console.error('❌ Error seeding styles:', err);
    process.exit(1);
  });