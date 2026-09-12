# Report API — background jobs with NestJS + Inngest

A small NestJS API that shows the standard pattern for long-running work without making the
client wait:


## How to run it

Install dependencies once: `pnpm install`

Run these two commands in two terminals:

**Terminal 1 — the Inngest Dev Server** (UI + runner, on <http://localhost:8288>):

```bash
pnpm dlx inngest-cli@latest dev
```

**Terminal 2 — the API** (on <http://localhost:3000>):

```bash
INNGEST_DEV=1 pnpm run start:dev
```

`INNGEST_DEV=1` points the SDK at the local dev server instead of Inngest Cloud. The API exposes the
Inngest handler at `/api/inngest`, which the Dev Server auto-discovers on port 3000 — no registration
step. Watch runs, steps and retries in the Dev Server UI.

## Endpoints

The three functions live in `reports.controller.ts`:

| Function | Endpoint | What it does |
| --- | --- | --- |
| `addReport(topic)` | `POST /reports` | Creates a `pending` report, sends `report/requested`, returns it with **202**. Invalid body → **400**. |
| `getReport(id)` | `GET /reports/:id` | One report — `pending` first, then `done` + `result`. Unknown id → **404**. |
| `getReports()` | `GET /reports` | All reports as an array. |

Plus one infrastructure route outside the reports module: `GET /health` → `{"status":"ok"}`.

Inngest functions (`src/inngest/index.ts`), served at `/api/inngest`:

| Function | Trigger | Behaviour |
| --- | --- | --- |
| `say-hello` | event `test/hello` | Sleeps 5s, returns a greeting. |
| `make-report` | event `report/requested` | Sleeps 8s, then builds the result and marks the report `done`. `retries: 2`; throws if `topic` is `"fail"`. |

## Examples

Captured from a real run against the two commands above.

The 202 response — the report is created and accepted, but not finished:

```console
$ curl -i -X POST http://localhost:3000/reports \
    -H 'Content-Type: application/json' -d '{"topic":"bounty"}'
HTTP/1.1 202 Accepted
Content-Type: application/json; charset=utf-8
Content-Length: 50

{"id":3,"topic":"bounty","status":"pending"}
```

Poll #1 — asked immediately, the work is still `pending`:

```console
$ curl -s -w '\n[HTTP %{http_code}]\n' http://localhost:3000/reports/3
{"id":3,"topic":"bounty","status":"pending"}
[HTTP 200]
```

Poll #2 — asked again after the background step finished, the same object is now `done`:

```console
$ curl -s -w '\n[HTTP %{http_code}]\n' http://localhost:3000/reports/3
{"id":3,"topic":"bounty","status":"done","result":"Report for bounty topic is ready."}
[HTTP 200]
```

## Retry logic
Invalid input (like a missing topic) is rejected immediately with a 400 and never retried, because retrying won't fix bad data — only transient failures (a "wrong moment," like a temporary network issue) warrant a retry.