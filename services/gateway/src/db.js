import pg from "pg";

const { Pool } = pg;

const DEFAULT_DATABASE_URL = "postgresql://todotest:todotest@localhost:15432/todotest";

export function createPool(connectionString = process.env.DATABASE_URL || DEFAULT_DATABASE_URL) {
  return new Pool({
    connectionString,
    // Adjusted for production environment
    max: 10, // Increase max connections for better performance under load
    connectionTimeoutMillis: 1000 // Increase timeout to reduce chances of timeout errors
  });
}

export const pool = createPool();