import postgres from 'postgres';
import type { UserBag } from './definitions';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function createUserBagsTable() {
  await sql`
    CREATE TABLE user_bags (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      serial_number TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE (user_id, serial_number)
    );
  `;
}

/** Ensures user_bags uses UUID user_id (matches users.id). Fixes legacy INTEGER columns. */
export async function ensureUserBagsSchema() {
  const [table] = await sql<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'user_bags'
    ) AS exists
  `;

  if (!table?.exists) {
    await createUserBagsTable();
    return;
  }

  const [column] = await sql<{ data_type: string }[]>`
    SELECT data_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_bags'
      AND column_name = 'user_id'
  `;

  if (column?.data_type !== 'uuid') {
    await sql`DROP TABLE user_bags`;
    await createUserBagsTable();
  }
}

export async function insertUserBag(
  userId: string,
  serialNumber: string,
  notes: string | null,
) {
  await ensureUserBagsSchema();

  await sql`
    INSERT INTO user_bags (user_id, serial_number, notes)
    VALUES (${userId}, ${serialNumber}, ${notes})
    ON CONFLICT (user_id, serial_number)
    DO UPDATE SET
      notes = COALESCE(EXCLUDED.notes, user_bags.notes),
      created_at = NOW()
  `;
}

export async function fetchUserBags(userId: string): Promise<UserBag[]> {
  await ensureUserBagsSchema();

  try {
    return await sql<UserBag[]>`
      SELECT serial_number, notes, created_at
      FROM user_bags
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch saved bags.');
  }
}
