import pg from "pg";

const { Pool } = pg;

const DEFAULT_DATABASE_URL = "postgresql://todotest:todotest@localhost:15432/todotest";

export function createPool(connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL) {
  return new Pool({
    connectionString,
    // BUG: tuned for local dev and never raised for production.
    max: 2,
    connectionTimeoutMillis: 500
  });
}

export const pool = createPool();
