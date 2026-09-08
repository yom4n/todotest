# TodoTest Connection Pool Incident Demo

This repo is a deliberately broken checkout service used to reproduce a production incident: database connection-pool exhaustion under load causes public checkout requests to return HTTP 504s.

The app has two services:

- `postgres`: Postgres 16 with a small `max_connections` setting and schema loaded from `db/init.sql`.
- `gateway`: a Node/Express checkout API that talks to Postgres through `pg.Pool`.

## The Incident

`POST /checkout` acquires a pooled Postgres client, calls a slow SQL function that holds the connection for about 400ms, then inserts an order. The gateway pool is undersized, so concurrent traffic queues behind only two available connections. Requests that wait past the short acquisition timeout return:

```json
{ "error": "gateway timeout", "detail": "timeout exceeded when trying to connect" }
```

## Run The Demo

Start Postgres and the gateway:

```bash
docker compose up
```

In another terminal, trigger the incident:

```bash
npm run seed
```

The load script sends 30 concurrent checkout requests to `http://localhost:3000` by default and prints a summary like:

```json
{ "total": 30, "ok": 4, "gateway_timeout_504": 26 }
```

Set `TARGET_URL` to point the load script somewhere else.

## Run Tests

The test suite expects a reachable Postgres database. With the compose database running:

```bash
docker compose up -d postgres
DATABASE_URL=postgresql://todotest:todotest@localhost:15432/todotest npm test
```

On PowerShell:

```powershell
$env:DATABASE_URL="postgresql://todotest:todotest@localhost:15432/todotest"
npm test
```

`checkout.happy.test.js` should pass in the buggy state. `checkout.pool.test.js` should fail in the buggy state because several concurrent requests return 504. After the correct fix, both tests should pass.

## The Bug

The bug is in `services/gateway/src/db.js` - the pool max is 2. Under concurrent load, requests queue past `connectionTimeoutMillis` and 504. The fix is to size the pool for real concurrency.
