import fs from 'fs';
import { parse } from 'csv-parse/sync';
import postgres from 'postgres';

// ✅ Neon-friendly SSL: rejectUnauthorized: false
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false }
});

// Define the CSV row type
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
  // 1️⃣ Create tables if they don't exist
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

  // 2️⃣ Loop through CSV rows
  for (const row of records) {
    // Parse years into start/end
    const years = row['Years in Prod.']
      .split(',')
      .map((y) => parseInt(y.trim()))
      .filter((y) => !isNaN(y));

    const production_start = Math.min(...years);
    const production_end = Math.max(...years);

    // Insert style
    const style = await sql`
      INSERT INTO styles (style_number, style_name, category, production_start, production_end, notes)
      VALUES (${row['No.']}, ${row.Name}, ${row.Category}, ${production_start}, ${production_end}, ${row.Colors})
      ON CONFLICT (style_number) DO UPDATE SET style_name = EXCLUDED.style_name
      RETURNING id
    `;
    const styleId = style[0].id;

    // Insert colors and link to style
    const colors = row.Colors.split(',').map((c) => c.trim());
    for (const colorName of colors) {
      // Insert color if it doesn't exist
      const color = await sql`
        INSERT INTO colors (name)
        VALUES (${colorName})
        ON CONFLICT (name) DO NOTHING
        RETURNING id
      `;

      let colorId;
      if (color.length > 0) {
        colorId = color[0].id;
      } else {
        const existing = await sql`SELECT id FROM colors WHERE name = ${colorName}`;
        colorId = existing[0].id;
      }

      // Insert into join table
      await sql`
        INSERT INTO style_colors (style_id, color_id)
        VALUES (${styleId}, ${colorId})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  console.log(`✅ Seeded ${records.length} styles with colors successfully!`);
}

// Run the seed script
seedStyles().catch((err) => {
  console.error('❌ Error seeding styles:', err);
});
