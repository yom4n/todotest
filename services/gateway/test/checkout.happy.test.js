import pg from "pg";
import pino from "pino";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createPool } from "../src/db.js";
import { createApp } from "../src/server.js";

const { Pool } = pg;
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://todotest:todotest@localhost:15432/todotest";

async function ensureSchema() {
  const adminPool = new Pool({ connectionString: DATABASE_URL });
  try {
    await adminPool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id serial PRIMARY KEY,
        sku text,
        created_at timestamptz DEFAULT now()
      );

      CREATE OR REPLACE FUNCTION slow_checkout(sku text)
      RETURNS text
      LANGUAGE plpgsql
      AS $$
      BEGIN
        PERFORM pg_sleep(0.4);
        INSERT INTO orders(sku) VALUES (sku);
        RETURN 'ok';
      END;
      $$;
    `);
  } finally {
    await adminPool.end();
  }
}

describe("POST /checkout happy path", () => {
  let dbPool;
  let app;

  beforeAll(async () => {
    await ensureSchema();
    dbPool = createPool(DATABASE_URL);
    app = createApp({ dbPool, logger: pino({ enabled: false }) });
  });

  beforeEach(async () => {
    await dbPool.query("TRUNCATE orders RESTART IDENTITY");
  });

  afterAll(async () => {
    await dbPool?.end();
  });

  it("returns 201 and inserts an order", async () => {
    const response = await request(app)
      .post("/checkout")
      .send({ sku: "happy-path-sku" });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ status: "ok", sku: "happy-path-sku" });

    const { rows } = await dbPool.query("SELECT sku FROM orders WHERE sku = $1", ["happy-path-sku"]);
    expect(rows).toHaveLength(1);
  });
});
