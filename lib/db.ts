import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function getConnectionString() {
  // Vercel's Storage integration prefixes env vars (e.g. STORAGE_POSTGRES_URL)
  // instead of the plain DATABASE_URL name — support both.
  return (
    process.env.STORAGE_POSTGRES_URL ||
    process.env.STORAGE_URL ||
    process.env.DATABASE_URL
  );
}

function getPool() {
  const connectionString = getConnectionString();
  if (!connectionString) {
    throw new Error(
      "No database connection string found. Set STORAGE_POSTGRES_URL, STORAGE_URL, or DATABASE_URL in your Vercel project's environment variables."
    );
  }

  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
    });
  }
  return global._pgPool;
}

let schemaReady: Promise<void> | null = null;

async function ensureSchema(pool: Pool) {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `create table if not exists rsvps (
          id serial primary key,
          name text not null,
          email text not null,
          guests integer not null default 1,
          message text,
          created_at timestamptz not null default now()
        )`
      )
      .then(() => undefined);
  }
  return schemaReady;
}

export async function getDb() {
  const pool = getPool();
  await ensureSchema(pool);
  return pool;
}

export type Rsvp = {
  id: number;
  name: string;
  email: string;
  guests: number;
  message: string | null;
  created_at: string;
};
