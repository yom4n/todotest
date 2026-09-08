import express from "express";
import pino from "pino";

import { pool } from "./db.js";
import { createCheckoutRouter } from "./routes/checkout.js";

export function createApp({ dbPool = pool, logger = pino() } = {}) {
  const app = express();

  app.use(express.json());
  app.use((req, _res, next) => {
    req.log = logger.child({ path: req.path, method: req.method });
    next();
  });
  app.get("/health", (_req, res) => res.json({ ok: true }));
  app.use(createCheckoutRouter({ dbPool, logger }));

  return app;
}

if (process.env.NODE_ENV !== "test") {
  const logger = pino();
  const app = createApp({ logger });
  const port = Number(process.env.PORT || 3000);
  const server = app.listen(port, () => {
    logger.info({ port }, "gateway listening");
  });

  process.on("SIGTERM", () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  });
}
