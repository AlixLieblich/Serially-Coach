import postgres from 'postgres';
import 'dotenv/config';

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is missing from environment variables');
}

const sql = postgres(process.env.POSTGRES_URL, {
  ssl: { rejectUnauthorized: false },
});

async function createUserBagsTable() {
  // Recreate with UUID user_id to match users.id (fixes INTEGER column mismatch)
  await sql`DROP TABLE IF EXISTS user_bags`;

  await sql`
    CREATE TABLE user_bags (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      serial_number TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, serial_number)
    );
  `;

  console.log('✅ user_bags table ready (user_id UUID → users.id)');
  await sql.end();
}

createUserBagsTable().catch((err) => {
  console.error('❌ Failed to create user_bags:', err);
  process.exit(1);
});
