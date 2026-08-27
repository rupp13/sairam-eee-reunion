import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Add a Postgres connection string in your Vercel project's environment variables (Vercel Postgres, Neon, and Supabase all work)."
    );
  }

  if (!global._pgPool) {
    global._pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
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
