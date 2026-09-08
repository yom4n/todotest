import { Router } from "express";

function isPoolAcquireTimeout(error) {
  return error instanceof Error && error.message.includes("timeout exceeded when trying to connect");
}

export function createCheckoutRouter({ dbPool, logger }) {
  const router = Router();

  router.post("/checkout", async (req, res) => {
    const sku = req.body?.sku || "demo-sku";
    let client;

    try {
      try {
        client = await dbPool.connect();
      } catch (error) {
        if (isPoolAcquireTimeout(error)) {
          logger.error({ err: error, sku }, "checkout database pool acquisition timed out");
          return res.status(504).json({
            error: "gateway timeout",
            detail: error.message
          });
        }
        throw error;
      }

      const result = await client.query("SELECT slow_checkout($1) AS status", [sku]);
      return res.status(201).json({
        status: result.rows[0]?.status || "ok",
        sku
      });
    } catch (error) {
      logger.error({ err: error, sku }, "checkout failed");
      return res.status(500).json({
        error: "internal server error",
        detail: error instanceof Error ? error.message : String(error)
      });
    } finally {
      if (client) {
        client.release();
      }
    }
  });

  return router;
}
