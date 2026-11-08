# Client API v1 order cases: results and gaps

Run on 2026-11-07 against a local scratch server built from this branch, which sits on
`api-recut` 93fbe93 with no API code changes. Fresh database from `db/schema.sql`, invented
clients, every outside integration off. Nothing was sent to a client, prod or the deployed server.

## Counts

| | Cases | Matches the code | Matches the contract | Body passes contract schema |
|---|---|---|---|---|
| Valid orders (V) | 12 | 12 | 9 | 0 |
| Contract or ruled shapes not built (S) | 7 | 7 | 3 | 7 |
| Failing attempts (F) | 55 | 55 | 51 | 44 (3 n/a) |
| **Total** | **74** | **74** | **63** | **51 (3 n/a)** |

All 74 cases behave exactly as the code on `api-recut` says they should: status, headers, body and
every field error with its exact message and fix. Of the 55 failing attempts, 47 are refused with
the right error and 8 get a success answer: 2 are bugs against the contract (F16, F17), 1 is test
mode not being built (F50), and 5 are accepted by design but worth a look (F23 to F26, F37).
The runner was also checked against six deliberately wrong expectations and failed all six.

## Gaps

### The server accepts what it should refuse

1. **Past pickup date is placed** (F16). Pickup yesterday returns `201` and a REQ order. The contract
   and pre-launch item 4 say `400` with `date_in_past` on `pickup.date`.
2. **Delivery before pickup is placed** (F17). Returns `201`. The contract says `400` with
   `before_pickup` on `delivery.date`.
3. **A test key reads a live order** (F50) and **a test-key order becomes a real Requests row** (V11).
   The code has no test mode: `KEY_PREFIX` is `mx_live_` only and nothing reads a mode, so a key
   stored as `mx_test_` is a live key. The contract says a `REQ-` id answers `404` to a test key and
   a test order gets a `TST-` id and never enters review. Today the admin screen cannot issue a test
   key, so this is not reachable yet, but the contract already promises it.

### The contract and the code disagree

4. **No order body passes both today.** The contract requires `hazmat` on every order; the
   validator does not know the field. V01 (no hazmat) is placed by the code but refused by the
   contract; S03 (the same order plus `hazmat: false`) is refused by the code with `unknown_field`.
5. **Documented order fields are refused as unknown**: `hazmat`, `hazmat_details`, `window_start`,
   `window_end`, `time_type`, `contact` (S01, S02). A client following the contract's own
   examples gets `400` with 8 `unknown_field` errors.
6. **Every order the code returns fails the contract schema**: `decline_reason`, `hazmat` and
   `hazmat_details` are required in `Order` and missing from `orderView` (19 order bodies: every
   V order, F16, F17, F23 to F26, F37, F50).
7. **`GET /v1/me` has no `mode`** (V12), which the contract's `Account` requires.
8. **Cancel is documented but not built.** `PUT /v1/orders/{id}/cancel` answers `404 not_found`
   instead of `200` (S07). `PATCH` on the same path answers `404` instead of the documented `405`
   with `Allow: PUT` (F40). Its 20-a-minute limit is already being counted.

### Accepted by design, worth a look

9. **Out-of-zone states that are not exact uppercase codes go to review, and the client is not told**:
   `dallas, tx` (F23) and `Austin, Texas` (F24) are placed with `201`. Only an exact uppercase
   two-letter code can refuse (`app/service_area.js`). A person has to catch these in Requests.
10. **Junk state or country codes go to review**: `ZZ` (F25) and a trailing `, XX` after a good
    Chicago, IL address (F26) are placed. Matches the contract text ("an address where the state
    cannot be read goes to review"), but nothing tells the client the address looked wrong.
11. **The same client ref twice with fresh Idempotency-Keys makes two orders** (F37). Neither the code
    nor the contract treats `ref` as unique, so a client that regenerates its key on each retry
    creates duplicates.

### Ruled by the owner, in neither the contract nor the code

12. **Stops array, any-of equipment and pieces lines** (owner review 11-06) are refused (S04, S05,
    S06), and the contract agrees with the code, so this is a contract gap, not a code bug. Field
    names in those cases are provisional. With no stops array there is no stop or line cap to test:
    a 25-stop array is one `unknown_field` (F29). The only list cap that exists is 50 field errors
    per answer (F30).

### What works as documented

Auth (missing, malformed, revoked, expired, never issued, key in the query string), scopes,
inactive accounts, tenancy (another client's order is `404`), the 9-state zone with US, Canada and
Mexico reads (F19 to F22), the 365-day ceiling and its boundary, the pieces and weight caps,
idempotent replay with keys in any order, `409` on a reused key, `413`, `415`, `405` with `Allow`,
list filters, and the 60-a-minute order limit (the 61st call gets `429` with `Retry-After`).

Not covered here: a chunked oversize body with no Content-Length, list paging with the `after`
cursor, and anything on loads, events, docs or capacity.

## Every case

| ID | Group | Case | Expected | Got | Code | Contract (want) | Schema | Gap |
|---|---|---|---|---|---|---|---|---|
| V01 | valid | Single pickup and delivery, tractor, pieces, weight, commodity, PO ref | 201 | 201 | PASS | FAIL (400) | FAIL | contract-requires-hazmat |
| V02 | valid | Straight truck, weight in kg, delivery date null | 201 | 201 | PASS | PASS | FAIL |  |
| V03 | valid | Minimal order: ref, pickup with date, delivery address only; full state name | 201 | 201 | PASS | PASS | FAIL |  |
| V04 | valid | Sprinter, same-day delivery, address ending in USA, notes | 201 | 201 | PASS | PASS | FAIL |  |
| V05 | valid | Pickup today (US Central), no equipment named | 201 | 201 | PASS | PASS | FAIL |  |
| V06 | valid | Pickup exactly 365 days out (the ceiling), delivery the day after | 201 | 201 | PASS | PASS | FAIL |  |
| V07 | valid | Pickup address with no readable state goes to review, not refused | 201 | 201 | PASS | PASS | FAIL |  |
| V08 | valid | Retry with the same Idempotency-Key and the same body (keys reordered) replays the order | 200 | 200 | PASS | PASS | FAIL |  |
| V09 | valid | Read an order back by id | 200 | 200 | PASS | PASS | FAIL |  |
| V10 | valid | List submitted orders, 5 per page | 200 | 200 | PASS | PASS | FAIL |  |
| V11 | valid | Test key places an order | 201 | 201 | PASS | FAIL | FAIL | test-keys-not-built |
| V12 | valid | Test key reads /v1/me | 200 | 200 | PASS | FAIL | FAIL | test-keys-not-built |
| S01 | contract-shape | Contract standard order: hazmat false, time windows, site contacts | 400 | 400 | PASS | FAIL (201) | PASS | contract-fields-not-built |
| S02 | contract-shape | Contract hazmat order with hazmat_details | 400 | 400 | PASS | FAIL (201) | PASS | contract-fields-not-built |
| S03 | contract-shape | Plain order plus hazmat:false, nothing else new | 400 | 400 | PASS | FAIL (201) | PASS | contract-fields-not-built |
| S04 | contract-shape | Multi-stop order as a stops array (one pickup, two deliveries) | 400 | 400 | PASS | PASS | PASS | ruled-shape-not-in-contract |
| S05 | contract-shape | Any-of equipment: a list of acceptable truck types | 400 | 400 | PASS | PASS | PASS | ruled-shape-not-in-contract |
| S06 | contract-shape | Pieces as lines (8 pallets + 4 crates) | 400 | 400 | PASS | PASS | PASS | ruled-shape-not-in-contract |
| S07 | contract-shape | Cancel a submitted order with PUT /v1/orders/{id}/cancel | 404 | 404 | PASS | FAIL (200) | PASS | cancel-not-built |
| F01 | failing | Empty JSON object | 400 | 400 | PASS | PASS | PASS |  |
| F02 | failing | Missing ref | 400 | 400 | PASS | PASS | PASS |  |
| F03 | failing | Pickup without a date | 400 | 400 | PASS | PASS | PASS |  |
| F04 | failing | Wrong types: numeric ref, pieces and weight as strings | 400 | 400 | PASS | PASS | PASS |  |
| F05 | failing | Fractional pieces (12.5) | 400 | 400 | PASS | PASS | PASS |  |
| F06 | failing | Pieces and weight over the caps (100001 pieces, 1000001 lbs) | 400 | 400 | PASS | PASS | PASS |  |
| F07 | failing | Weight unit spelled out ("pounds") | 400 | 400 | PASS | PASS | PASS |  |
| F08 | failing | US-style pickup date (11/12/2026) | 400 | 400 | PASS | PASS | PASS |  |
| F09 | failing | Impossible delivery date (2027-02-30) | 400 | 400 | PASS | PASS | PASS |  |
| F10 | failing | Malformed JSON (trailing comma) | 400 | 400 | PASS | PASS | PASS |  |
| F11 | failing | Batch of two orders sent as a JSON array | 400 | 400 | PASS | PASS | PASS |  |
| F12 | failing | Content-Type text/plain | 415 | 415 | PASS | PASS | PASS |  |
| F13 | failing | Form-encoded body | 415 | 415 | PASS | PASS | PASS |  |
| F14 | failing | No Idempotency-Key header | 400 | 400 | PASS | PASS | PASS |  |
| F15 | failing | Idempotency-Key too short ("1015") | 400 | 400 | PASS | PASS | PASS |  |
| F16 | failing | Pickup date yesterday | 201 | 201 | PASS | FAIL (400) | FAIL | accepts-what-it-should-refuse |
| F17 | failing | Delivery date before pickup date | 201 | 201 | PASS | FAIL (400) | FAIL | accepts-what-it-should-refuse |
| F18 | failing | Pickup 366 days out (one past the ceiling) | 400 | 400 | PASS | PASS | PASS |  |
| F19 | failing | Delivery in Texas (outside the 9-state zone) | 400 | 400 | PASS | PASS | PASS |  |
| F20 | failing | Pickup in Pennsylvania (ruled out on 11-06) | 400 | 400 | PASS | PASS | PASS |  |
| F21 | failing | Both stops outside: California pickup, Ontario (Canada) delivery | 400 | 400 | PASS | PASS | PASS |  |
| F22 | failing | Delivery in Nuevo Leon, Mexico | 400 | 400 | PASS | PASS | PASS |  |
| F23 | failing | Out-of-zone state in lowercase ("dallas, tx") | 201 | 201 | PASS | PASS | FAIL | zone-slips-to-review |
| F24 | failing | Out-of-zone state spelled out ("Austin, Texas") | 201 | 201 | PASS | PASS | FAIL | zone-slips-to-review |
| F25 | failing | Unknown state code (ZZ) | 201 | 201 | PASS | PASS | FAIL |  |
| F26 | failing | Unknown country code at the end (", XX") | 201 | 201 | PASS | PASS | FAIL |  |
| F27 | failing | Equipment Moscoso does not run ("reefer") | 400 | 400 | PASS | PASS | PASS |  |
| F28 | failing | Equipment as a display label ("Straight Truck") | 400 | 400 | PASS | PASS | PASS |  |
| F29 | failing | Too many stops: a 25-stop array beside pickup and delivery | 400 | 400 | PASS | PASS | PASS |  |
| F30 | failing | Too many problems: 60 unknown fields from a TMS record dump | 400 | 400 | PASS | PASS | PASS |  |
| F31 | failing | Oversize payload: notes of 70,000 characters | 413 | 413 | PASS | PASS | PASS |  |
| F32 | failing | Text fields too long: ref 101, commodity 301, notes 2001 characters | 400 | 400 | PASS | PASS | PASS |  |
| F33 | failing | Pickup address too short ("IL"), delivery address all spaces | 400 | 400 | PASS | PASS | PASS |  |
| F34 | failing | Spoofed client: client_id and client_code in the body | 400 | 400 | PASS | PASS | PASS |  |
| F35 | failing | Guessed stop fields: pickup.time and delivery.appointment | 400 | 400 | PASS | PASS | PASS |  |
| F36 | failing | Same Idempotency-Key reused with a different body | 409 | 409 | PASS | PASS | PASS |  |
| F37 | failing | Same client ref sent twice with fresh Idempotency-Keys | 201 | 201 | PASS | PASS | FAIL | duplicate-ref |
| F38 | failing | DELETE /v1/orders | 405 | 405 | PASS | PASS | n/a |  |
| F39 | failing | PATCH /v1/orders/{id} to edit an order | 405 | 405 | PASS | PASS | n/a |  |
| F40 | failing | Cancel with PATCH (the superseded ruling 9 verb) | 404 | 404 | PASS | FAIL (405) | n/a | cancel-not-built |
| F41 | failing | No Authorization header | 401 | 401 | PASS | PASS | PASS |  |
| F42 | failing | Malformed Authorization ("Token ...") | 401 | 401 | PASS | PASS | PASS |  |
| F43 | failing | Revoked key | 401 | 401 | PASS | PASS | PASS |  |
| F44 | failing | Expired key | 401 | 401 | PASS | PASS | PASS |  |
| F45 | failing | Well-formed key that was never issued | 401 | 401 | PASS | PASS | PASS |  |
| F46 | failing | Key sent in the query string | 401 | 401 | PASS | PASS | PASS |  |
| F47 | failing | Read-only key tries to place an order | 403 | 403 | PASS | PASS | PASS |  |
| F48 | failing | Key of an inactive client account | 403 | 403 | PASS | PASS | PASS |  |
| F49 | failing | Another client reads my order by id | 404 | 404 | PASS | PASS | PASS |  |
| F50 | failing | Test key reads a live order | 200 | 200 | PASS | FAIL (404) | FAIL | accepts-what-it-should-refuse |
| F51 | failing | Order id that does not exist | 404 | 404 | PASS | PASS | PASS |  |
| F52 | failing | List orders with an unknown status filter ("pending") | 400 | 400 | PASS | PASS | PASS |  |
| F53 | failing | List orders with page=2 instead of the cursor | 400 | 400 | PASS | PASS | PASS |  |
| F54 | failing | POST /v1/orders?dry_run=true | 400 | 400 | PASS | PASS | PASS |  |
| F55 | failing | Burst of 61 orders in under a minute on one key | 429 | 429 | PASS | PASS | PASS |  |
