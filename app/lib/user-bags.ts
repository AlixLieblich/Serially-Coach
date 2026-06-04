import postgres from 'postgres';
import type { SavedBagWithDetails, UserBag } from './definitions';
import { lookupSerial } from './serial';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

async function createUserBagsTable() {
  await sql`
    CREATE TABLE user_bags (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      serial_number TEXT NOT NULL,
      notes TEXT,
      bag_color_id INTEGER REFERENCES bag_colors(bag_color_id),
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
  bagColorId: number | null,
) {
  await ensureUserBagsSchema();

  await sql`
    INSERT INTO user_bags (user_id, serial_number, notes, bag_color_id)
    VALUES (${userId}, ${serialNumber}, ${notes}, ${bagColorId})
    ON CONFLICT (user_id, serial_number)
    DO UPDATE SET
      notes = COALESCE(EXCLUDED.notes, user_bags.notes),
      bag_color_id = EXCLUDED.bag_color_id,
      created_at = NOW()
  `;
}

export async function updateUserBag(
  userId: string,
  serialNumber: string,
  notes: string | null,
  bagColorId: number | null,
) {
  await ensureUserBagsSchema();

  const updated = await sql`
    UPDATE user_bags
    SET notes = ${notes}, bag_color_id = ${bagColorId}
    WHERE user_id = ${userId} AND serial_number = ${serialNumber}
    RETURNING serial_number
  `;

  if (updated.length === 0) {
    throw new Error('Bag not found.');
  }
}

export async function fetchUserBags(userId: string): Promise<UserBag[]> {
  await ensureUserBagsSchema();

  try {
    return await sql<UserBag[]>`
      SELECT
        ub.serial_number,
        ub.notes,
        ub.bag_color_id,
        bc.name AS color_name,
        ub.created_at
      FROM user_bags ub
      LEFT JOIN bag_colors bc ON bc.bag_color_id = ub.bag_color_id
      WHERE ub.user_id = ${userId}
      ORDER BY ub.created_at DESC
    `;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch saved bags.');
  }
}

export async function fetchUserBagsWithDetails(
  userId: string,
): Promise<SavedBagWithDetails[]> {
  const bags = await fetchUserBags(userId);

  return Promise.all(
    bags.map(async (bag) => {
      try {
        const decoded = await lookupSerial(bag.serial_number);
        if (typeof decoded === 'string') {
          return { ...bag, details: null, decodeError: decoded };
        }
        return { ...bag, details: decoded };
      } catch {
        return {
          ...bag,
          details: null,
          decodeError: 'Could not decode this serial number.',
        };
      }
    }),
  );
}
