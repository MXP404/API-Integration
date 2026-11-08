# Client API v1 order cases (dummy data)

Dummy client requests for the Moscoso Express Client API v1 (`POST /v1/orders` and the order
endpoints a client calls next: `GET /v1/orders`, `GET /v1/orders/{id}`,
`PUT /v1/orders/{id}/cancel`, `GET /v1/me`), each with the answer it should get. 74 cases:
12 valid orders, 7 order shapes that are designed but not built yet, and 55 failing attempts a
client could plausibly send (missing fields, wrong types, bad keys, out-of-zone stops, oversize
bodies, wrong content type, reused idempotency keys, the 61st order in a minute, and more).

All data is invented: companies, contact names, emails (`@example.com`), phones (555 numbers)
and street addresses. Real city and state names appear only because the service-area rule reads
them.

## Groups

- `V` cases: orders the API accepts today.
- `S` cases: shapes the contract or the owner's rulings describe that the API does not take yet
  (hazmat, time windows, site contacts, stops array, any-of equipment, pieces lines, cancel).
- `F` cases: attempts that should be refused, or are accepted by design (each one says which).

## Files

- `cases/*.json`: one case per file.
- `make_fixtures.mjs`: writes `cases/` (plain Node, no dependencies). Edit it, not the JSON,
  then run `node make_fixtures.mjs`.
- `REPORT.md`: results of the 2026-11-07 run against the API at `api-recut` 93fbe93, with the
  gaps found (2 bugs: past pickup dates and delivery before pickup are accepted).
- `run.mjs`: the replay runner. It starts the API server, so it only runs from a checkout of
  the Moscoso platform repo: copy this folder to `tests/fixtures/api-v1-orders/` there and run
  `node tests/fixtures/api-v1-orders/run.mjs`. It builds an empty scratch database, seeds three
  invented clients, replays every case, prints a pass/fail table, then cleans up. It refuses any
  address that is not on the local machine, so it can never reach production. Options:
  `--only V01,F16`, `--md report.md`, `--json results.json`, `--keep`, `--port n`, and
  `--base http://127.0.0.1:4600 --keys keys.json` for a server you started yourself.

## How a case is judged

- **code**: the answer matches `expect`: status, media type, headers, body, and every field
  error with its exact `message` and `fix`, as the API answered when the case was written.
- **contract**: the answer matches the `contract` block where the case has one (what the
  published contract documents). Otherwise the status must match `expect`.
- **schema**: the body validates against the schema the contract gives for that operation.

When a contract item lands (hazmat, windows, date checks, cancel, test keys), the cases that
cover it fail the code column on purpose and their contract column turns to a match. Then update
`expect` in `make_fixtures.mjs` and regenerate.

## Case format

```json
{
  "id": "F19", "group": "failing", "title": "...", "why": "what the client is doing",
  "setup":   [ { "method": "POST", "path": "/v1/orders", "headers": {}, "body": {}, "expect": { "status": 201 }, "save": { "id": "id" } } ],
  "request": { "method": "POST", "path": "/v1/orders", "headers": {}, "body": {}, "raw_body": "...", "repeat": 61 },
  "expect":  { "status": 400, "content_type": "application/problem+json", "headers": { "Allow": "GET, POST" },
               "body": { "code": "bad_request" }, "errors": [ { "field": "", "code": "", "message": "", "fix": "" } ] },
  "contract": { "status": 201, "errors": [ { "field": "", "code": "" } ], "note": "what the contract says" },
  "gap": "short tag", "note": "why it is accepted, if it is"
}
```
