#!/usr/bin/env node
// tests/fixtures/api-v1-orders/make_fixtures.mjs — writes cases/*.json, one file per case.
//
//   node tests/fixtures/api-v1-orders/make_fixtures.mjs
//
// The JSON files are what the runner reads and what gets committed; this script only keeps
// them consistent. Every expected status, code, message and fix below was read from
// app/api_v1.js on api-recut 93fbe93 (validateOrder, placeOrder, createOrder, dispatch,
// authenticate). A `contract` block says what api/openapi.json documents where it differs.
//
// All data is invented: companies, people, refs, streets. Real city and state names appear
// only because the service-area rule reads them. Phones are 555-01xx, emails @example.com.
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'cases');

// ------------------------------------------------------------------ building blocks
const ORDERS = '/v1/orders';
const auth = key => ({ Authorization: `Bearer {{key:${key}}}` });
const post = (key = 'live', idem = '{{idem}}') => ({ ...auth(key), 'Content-Type': 'application/json', 'Idempotency-Key': idem });

const A = {
  elk: '1200 Example Pkwy, Elk Grove Village, IL, 60007',
  columbus: '2200 Sample Rd, Columbus, OH, 43217',
  milwaukee: '450 Placeholder Ave, Milwaukee, WI 53204',
  stlouis: '1500 Fictional Way, St. Louis, MO, 63110',
  joliet: '15 Warehouse Row, Joliet, IL 60431',
  indy: '77 Test Industrial Dr, Indianapolis, Indiana 46241',
  detroit: '9000 Demo Blvd, Detroit, MI, 48201, USA',
  louisville: '310 Mock Ln, Louisville, KY 40213',
  desmoines: '640 Sample Ct, Des Moines, IA 50309',
  minneapolis: '82 Example Loop, Minneapolis, MN, 55413',
  unreadable: 'Building 7, Gate B, Example Industrial Park',
  dallas: '4100 Example Blvd, Dallas, TX, 75201',
  dallasLower: '4100 Example Blvd, dallas, tx 75201',
  austinName: '55 Sample Ave, Austin, Texas 78701',
  pittsburgh: '300 Sample St, Pittsburgh, PA 15222',
  sacramento: '18 Test Ave, Sacramento, CA 95814',
  toronto: '100 Example St, Toronto, ON, M5V 2T6, CA',
  monterrey: 'Av. Ejemplo 200, Monterrey, NL, 64000, MX',
  zz: '9 Placeholder Rd, Springfield, ZZ 62704',
  xx: '1200 Example Pkwy, Chicago, IL, 60601, XX',
};

// A plain order in the shape the code accepts today.
const order = (over = {}) => ({
  ref: 'TEST-PO-1001',
  pickup: { address: A.elk, date: '{{date:+3}}' },
  delivery: { address: A.columbus, date: '{{date:+4}}' },
  equipment: 'tractor',
  pieces: 12,
  weight: { value: 2400, unit: 'lbs' },
  commodity: 'Boxed machine parts',
  ...over,
});

const REQ_ID = '^REQ-[0-9]+$';
const UTC_TS = '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$';
const PROBLEM = 'application/problem+json';
const JSONT = 'application/json';

const fix = (name, what) => `Send ${name} as ${what}.`;
const E = {
  required: (f, what) => ({ field: f, code: 'required', message: `${f} is missing.`, fix: fix(f, what) }),
  wrongType: (f, kind, what) => ({ field: f, code: 'wrong_type', message: `${f} must be ${kind}.`, fix: fix(f, what) }),
  unknown: f => ({ field: f, code: 'unknown_field', message: `${f} is not a field of this API.`, fix: 'Remove this field.' }),
  tooShort: (f, what) => ({ field: f, code: 'too_short', message: `${f} is too short.`, fix: fix(f, what) }),
  tooLong: (f, what) => ({ field: f, code: 'too_long', message: `${f} is too long.`, fix: fix(f, what) }),
  badDate: (f, what) => ({ field: f, code: 'invalid_format', message: `${f} is not a real date in YYYY-MM-DD form.`, fix: fix(f, what) }),
  notAllowed: (f, what) => ({ field: f, code: 'invalid_value', message: `${f} is not an allowed value.`, fix: fix(f, what) }),
  outside: (stop, place) => ({ field: `${stop}.address`, code: 'outside_service_area',
    message: `The ${stop} address is in ${place}, which is outside the Moscoso Express service area.`,
    fix: 'This order was not placed; contact API@MoscosoExpress.com to ask about this lane.' }),
};
const STR = (min, max) => `a string of ${min} to ${max} characters`;
const EQUIP = 'one of tractor, straight_truck, sprinter';
const problems = n => `The request body has ${n} problem${n === 1 ? '' : 's'}.`;
const invalid = (errors, detail = problems(errors.length)) => ({
  status: 400, content_type: PROBLEM,
  body: { type: 'about:blank', title: 'Bad request', status: 400, code: 'bad_request', detail },
  errors,
});
const plain400 = detail => ({ status: 400, content_type: PROBLEM, body: { title: 'Bad request', status: 400, code: 'bad_request', detail }, no_errors: true });
const problem = (status, code, title, detail, extra = {}) => ({ status, content_type: PROBLEM, body: { type: 'about:blank', title, status, code, detail }, no_errors: true, ...extra });
const unauthorized = (detail = 'A valid API key is required.') => problem(401, 'unauthorized', 'Unauthorized', detail, { headers: { 'WWW-Authenticate': 'Bearer' } });
const notFound = () => problem(404, 'not_found', 'Not found', 'Nothing was found for this key.');
// The Order the code returns for a body built with order(): what it echoes back.
const placed = (o, status = 201) => ({
  status, content_type: JSONT,
  body: {
    ref: o.ref, status: 'submitted',
    pickup: { address: o.pickup.address, date: o.pickup.date },
    delivery: { address: o.delivery.address, date: o.delivery.date ?? null },
    equipment: o.equipment ?? null, pieces: o.pieces ?? null, weight: o.weight ?? null, commodity: o.commodity ?? null,
    loads: [],
  },
  body_match: { id: REQ_ID, created_at: UTC_TS },
});
// A setup step that places an order and saves its id.
const setupOrder = (key = 'live', over = {}, idem = '{{idem:setup}}') => ({
  method: 'POST', path: ORDERS, headers: post(key, idem), body: order(over), expect: { status: 201 }, save: { id: 'id' },
});

const cases = [];
const add = c => cases.push(c);

// ================================================================== VALID — the code accepts these today
{
  const o = order({ notes: 'Dock 4. Call 30 minutes ahead.' });
  add({ id: 'V01', group: 'valid', title: 'Single pickup and delivery, tractor, pieces, weight, commodity, PO ref',
    why: 'The everyday order: one pickup, one delivery, a tractor, a PO number as ref.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: placed(o),
    contract: { status: 400, errors: [{ field: 'hazmat', code: 'required' }],
      note: 'The contract requires hazmat on every order (OrderInput.required). The code does not know the field, so it places this order. Every other order in this set that omits hazmat would draw the same error under the contract.' },
    gap: 'contract-requires-hazmat' });
}
{
  const o = order({ ref: 'TEST-PO-1002', pickup: { address: A.milwaukee, date: '{{date:+2}}' }, delivery: { address: A.stlouis, date: null },
    equipment: 'straight_truck', pieces: 4, weight: { value: 900, unit: 'kg' }, commodity: 'Display fixtures' });
  add({ id: 'V02', group: 'valid', title: 'Straight truck, weight in kg, delivery date null',
    why: 'Metric shipper; delivery day left open for Moscoso to set.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = { ref: 'TEST-PO-1003', pickup: { address: A.joliet, date: '{{date:+1}}' }, delivery: { address: A.indy } };
  add({ id: 'V03', group: 'valid', title: 'Minimal order: ref, pickup with date, delivery address only; full state name',
    why: 'Smallest body the code takes. Delivery address spells out "Indiana", which reads as an allowed state.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = order({ ref: 'TEST-PO-1004', pickup: { address: A.detroit, date: '{{date:+5}}' }, delivery: { address: A.louisville, date: '{{date:+5}}' },
    equipment: 'sprinter', pieces: 2, weight: { value: 180, unit: 'lbs' }, commodity: 'Medical supplies',
    notes: 'Liftgate needed at delivery. Receiving open 07:00-15:00.' });
  add({ id: 'V04', group: 'valid', title: 'Sprinter, same-day delivery, address ending in USA, notes',
    why: 'Small expedited load; the window goes in notes because the code has no window fields yet.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = order({ ref: 'TEST-PO-1005', pickup: { address: A.desmoines, date: '{{date:+0}}' }, delivery: { address: A.minneapolis, date: '{{date:+1}}' } });
  delete o.equipment;
  add({ id: 'V05', group: 'valid', title: 'Pickup today (US Central), no equipment named',
    why: 'Same-day pickup is the earliest date allowed; equipment is optional.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = order({ ref: 'TEST-PO-1006', pickup: { address: A.elk, date: '{{date:+365}}' }, delivery: { address: A.columbus, date: '{{date:+366}}' } });
  add({ id: 'V06', group: 'valid', title: 'Pickup exactly 365 days out (the ceiling), delivery the day after',
    why: 'Boundary of ruling 12: pickup at most 365 days after today. Delivery has no ceiling.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = order({ ref: 'TEST-PO-1007', pickup: { address: A.unreadable, date: '{{date:+3}}' } });
  add({ id: 'V07', group: 'valid', title: 'Pickup address with no readable state goes to review, not refused',
    why: 'A site name with no state. The zone rule never refuses on a guess, so it is placed for a person to check.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o) });
}
{
  const o = order({ ref: 'TEST-PO-1008' });
  const reordered = { commodity: o.commodity, weight: { unit: 'lbs', value: 2400 }, pieces: 12, equipment: 'tractor',
    delivery: { date: o.delivery.date, address: o.delivery.address }, pickup: { date: o.pickup.date, address: o.pickup.address }, ref: o.ref };
  add({ id: 'V08', group: 'valid', title: 'Retry with the same Idempotency-Key and the same body (keys reordered) replays the order',
    why: 'A client times out and resends. The second call must return the first order, not a new one.',
    setup: [{ method: 'POST', path: ORDERS, headers: post('live', '{{idem:r}}'), body: o, expect: { status: 201 }, save: { id: 'id' } }],
    request: { method: 'POST', path: ORDERS, headers: post('live', '{{idem:r}}'), body: reordered },
    expect: { ...placed(o, 200), headers: { 'Idempotency-Replayed': 'true' }, body: { ...placed(o).body, id: '{{saved:id}}' } } });
}
add({ id: 'V09', group: 'valid', title: 'Read an order back by id',
  why: 'After placing, the client checks its status.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1009' })],
  request: { method: 'GET', path: `${ORDERS}/{{saved:id}}`, headers: auth('live') },
  expect: { status: 200, content_type: JSONT, body: { id: '{{saved:id}}', ref: 'TEST-PO-1009', status: 'submitted', loads: [] } } });
add({ id: 'V10', group: 'valid', title: 'List submitted orders, 5 per page',
  why: 'A client polls its open orders.',
  request: { method: 'GET', path: `${ORDERS}?status=submitted&limit=5`, headers: auth('live') },
  expect: { status: 200, content_type: JSONT, body_match: { has_more: '^(true|false)$' }, body_types: { data: 'array', has_more: 'boolean' } } });
{
  const o = order({ ref: 'TEST-PO-1011' });
  add({ id: 'V11', group: 'valid', title: 'Test key places an order',
    why: 'A client integrating for the first time uses its mx_test_ key.',
    request: { method: 'POST', path: ORDERS, headers: post('test'), body: o },
    expect: placed(o),
    contract: { status: 201, body_match: { id: '^TST-[0-9]+$' },
      note: 'Contract: a test-key order gets a TST- id, stays submitted and never enters Moscoso review. The code has no test keys (KEY_PREFIX is mx_live_ only), so a key stored as mx_test_ is a live key: the order gets a REQ- id and lands in Requests. Under the contract this body would also draw hazmat required (see V01).' },
    gap: 'test-keys-not-built' });
}
add({ id: 'V12', group: 'valid', title: 'Test key reads /v1/me',
  why: 'The client checks which kind of key it holds.',
  request: { method: 'GET', path: '/v1/me', headers: auth('test') },
  expect: { status: 200, content_type: JSONT, body: { user: { name: 'Casey Example', email: 'casey.ops@example.com' }, client: { code: 'ZLW', name: 'Lakeshore Widget Supply (test)' } } },
  contract: { status: 200, body: { mode: 'test' }, note: 'Contract Account requires mode (live or test). The code returns no mode.' },
  gap: 'test-keys-not-built' });

// ================================================================== CONTRACT OR RULED SHAPE — not built in the code yet
{
  const o = { ref: 'TEST-PO-2001', hazmat: false,
    pickup: { address: A.elk, date: '{{date:+3}}', window_start: '08:30', window_end: '10:00', time_type: 'target', contact: { name: 'Casey Example', phone: '847-555-0142' } },
    delivery: { address: A.columbus, date: '{{date:+4}}', window_start: '10:00', time_type: 'appointment', contact: { name: 'Robin Sample', phone: '614-555-0118' } },
    equipment: 'tractor', pieces: 12, weight: { value: 2400, unit: 'lbs' }, commodity: 'Boxed machine parts', notes: 'Liftgate needed at delivery.' };
  add({ id: 'S01', group: 'contract-shape', title: 'Contract standard order: hazmat false, time windows, site contacts',
    why: 'Exactly what api/openapi.json tells a client to send (its "standard" example, with invented data).',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.unknown('hazmat'), E.unknown('pickup.window_start'), E.unknown('pickup.window_end'), E.unknown('pickup.time_type'),
      E.unknown('pickup.contact'), E.unknown('delivery.window_start'), E.unknown('delivery.time_type'), E.unknown('delivery.contact')]),
    contract: { status: 201, note: 'Contract 1.0.0 on api-recut documents hazmat, window_start, window_end, time_type and contact. The validator (validateOrder, refuseUnknown) still allows only ref, pickup{address,date}, delivery{address,date}, equipment, pieces, weight, commodity, notes.' },
    gap: 'contract-fields-not-built' });
}
{
  const o = { ref: 'TEST-PO-2002', hazmat: true,
    hazmat_details: { un_number: 'UN1263', hazard_class: '3', weight: { value: 500, unit: 'lbs' }, emergency_phone: '312-555-0199' },
    pickup: { address: A.elk, date: '{{date:+3}}' }, delivery: { address: A.columbus, date: '{{date:+4}}' },
    equipment: 'tractor', pieces: 10, weight: { value: 500, unit: 'lbs' }, commodity: 'Paint' };
  add({ id: 'S02', group: 'contract-shape', title: 'Contract hazmat order with hazmat_details',
    why: 'A hazmat shipper following the contract hazmat example.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.unknown('hazmat'), E.unknown('hazmat_details')]),
    contract: { status: 201, note: 'Pre-launch item 1 (hazmat required, details when true) is in the contract, not in the code.' },
    gap: 'contract-fields-not-built' });
}
{
  const o = order({ ref: 'TEST-PO-2003', hazmat: false });
  add({ id: 'S03', group: 'contract-shape', title: 'Plain order plus hazmat:false, nothing else new',
    why: 'The smallest contract-correct order. The code refuses it for the one field the contract requires.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.unknown('hazmat')]),
    contract: { status: 201, note: 'With V01 this shows no order body passes both the contract and the code today: without hazmat the contract refuses it, with hazmat the code refuses it.' },
    gap: 'contract-fields-not-built' });
}
{
  const o = { ref: 'TEST-PO-2004', stops: [
    { type: 'pickup', address: A.elk, date: '{{date:+3}}' },
    { type: 'delivery', address: A.milwaukee, date: '{{date:+3}}' },
    { type: 'delivery', address: A.joliet, date: '{{date:+4}}' }],
    equipment: 'straight_truck', pieces: 9, weight: { value: 3100, unit: 'lbs' }, commodity: 'Retail fixtures' };
  add({ id: 'S04', group: 'contract-shape', title: 'Multi-stop order as a stops array (one pickup, two deliveries)',
    why: 'Owner review 11-06: orders take an array of stops. Field names here are provisional; neither the contract nor the code has a stops array.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.unknown('stops'), E.required('pickup', 'an object'), E.required('delivery', 'an object')]),
    contract: { status: 400, note: 'Contract 1.0.0 also has no stops array (OrderInput is pickup + delivery, additionalProperties false), so code and contract agree. The gap is against the owner 11-06 load-shape review, which is not in the contract yet.' },
    gap: 'ruled-shape-not-in-contract' });
}
{
  const o = order({ ref: 'TEST-PO-2005', equipment: ['tractor', 'straight_truck'] });
  add({ id: 'S05', group: 'contract-shape', title: 'Any-of equipment: a list of acceptable truck types',
    why: 'Owner review 11-06: equipment on an order is a list of acceptable types. Provisional shape.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.wrongType('equipment', 'a string', EQUIP)]),
    contract: { status: 400, note: 'Contract EquipmentType is a single string, so code and contract agree. Gap against the 11-06 review only.' },
    gap: 'ruled-shape-not-in-contract' });
}
{
  const o = order({ ref: 'TEST-PO-2006', pieces: [{ count: 8, type: 'pallet', length_in: 48, width_in: 40, height_in: 50 }, { count: 4, type: 'crate' }] });
  add({ id: 'S06', group: 'contract-shape', title: 'Pieces as lines (8 pallets + 4 crates)',
    why: 'Owner 11-06 confirmed pieces lines. Provisional shape.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: invalid([E.wrongType('pieces', 'a number', 'a whole number from 0 to 100000')]),
    contract: { status: 400, note: 'Contract pieces is an integer, so code and contract agree. Gap against the 11-06 review only.' },
    gap: 'ruled-shape-not-in-contract' });
}
add({ id: 'S07', group: 'contract-shape', title: 'Cancel a submitted order with PUT /v1/orders/{id}/cancel',
  why: 'Ruling 17: cancel is PUT. Allowed while submitted or in_review.',
  setup: [setupOrder('live', { ref: 'TEST-PO-2007' })],
  request: { method: 'PUT', path: `${ORDERS}/{{saved:id}}/cancel`, headers: auth('live') },
  expect: notFound(),
  contract: { status: 200, body: { id: '{{saved:id}}', status: 'canceled' },
    note: 'Contract documents cancelOrder (200, 409 conflict). No route is built: the path falls through to 404 not_found. Its rate limit (20) is already counted.' },
  gap: 'cancel-not-built' });

// ================================================================== FAILING — attempts a client could plausibly send
add({ id: 'F01', group: 'failing', title: 'Empty JSON object',
  why: 'A client library sends {} when its order mapping fails.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: {} },
  expect: invalid([E.required('ref', STR(1, 100)), E.required('pickup', 'an object'), E.required('delivery', 'an object')]) });
{
  const o = order(); delete o.ref;
  add({ id: 'F02', group: 'failing', title: 'Missing ref', why: 'Client forgot to map its PO number.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: invalid([E.required('ref', STR(1, 100))]) });
}
add({ id: 'F03', group: 'failing', title: 'Pickup without a date', why: 'Client sends a "ready when you are" pickup.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pickup: { address: A.elk } }) },
  expect: invalid([E.required('pickup.date', 'YYYY-MM-DD')]) });
add({ id: 'F04', group: 'failing', title: 'Wrong types: numeric ref, pieces and weight as strings',
  why: 'Client serializes everything from a CSV as text, and its PO number as a number.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 1001, pieces: '12', weight: { value: '2400', unit: 'lbs' } }) },
  expect: invalid([E.wrongType('ref', 'a string', STR(1, 100)), E.wrongType('pieces', 'a number', 'a whole number from 0 to 100000'),
    E.wrongType('weight.value', 'a number', 'a number from 0 to 1000000')]) });
add({ id: 'F05', group: 'failing', title: 'Fractional pieces (12.5)', why: 'Client averages pieces across lines.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pieces: 12.5 }) },
  expect: invalid([E.wrongType('pieces', 'a whole number', 'a whole number from 0 to 100000')]) });
add({ id: 'F06', group: 'failing', title: 'Pieces and weight over the caps (100001 pieces, 1000001 lbs)',
  why: 'Ruling 12 caps: pieces 0 to 100000, weight up to 1000000. A unit mix-up (grams as lbs) blows past them.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pieces: 100001, weight: { value: 1000001, unit: 'lbs' } }) },
  expect: invalid([{ field: 'pieces', code: 'invalid_value', message: 'pieces must be a whole number from 0 to 100000.', fix: fix('pieces', 'a whole number from 0 to 100000') },
    { field: 'weight.value', code: 'invalid_value', message: 'weight.value must be a number from 0 to 1000000.', fix: fix('weight.value', 'a number from 0 to 1000000') }]) });
add({ id: 'F07', group: 'failing', title: 'Weight unit spelled out ("pounds")', why: 'Client uses its own unit label.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ weight: { value: 2400, unit: 'pounds' } }) },
  expect: invalid([E.notAllowed('weight.unit', 'one of lbs, kg')]) });
add({ id: 'F08', group: 'failing', title: 'US-style pickup date (11/12/2026)', why: 'Client sends the date as shown on its screen.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pickup: { address: A.elk, date: '11/12/2026' } }) },
  expect: invalid([E.badDate('pickup.date', 'YYYY-MM-DD')]) });
add({ id: 'F09', group: 'failing', title: 'Impossible delivery date (2027-02-30)', why: 'Client adds days to a date without a calendar.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ delivery: { address: A.columbus, date: '2027-02-30' } }) },
  expect: invalid([E.badDate('delivery.date', 'YYYY-MM-DD or null')]) });
add({ id: 'F10', group: 'failing', title: 'Malformed JSON (trailing comma)', why: 'Hand-built JSON string.',
  request: { method: 'POST', path: ORDERS, headers: post(),
    raw_body: '{"ref":"TEST-PO-1010","pickup":{"address":"1200 Example Pkwy, Elk Grove Village, IL, 60007","date":"{{date:+3}}"},"delivery":{"address":"2200 Sample Rd, Columbus, OH, 43217"},}' },
  expect: plain400('The body is not valid JSON.') });
add({ id: 'F11', group: 'failing', title: 'Batch of two orders sent as a JSON array', why: 'Client tries to place several orders in one call.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: [order({ ref: 'TEST-PO-1101' }), order({ ref: 'TEST-PO-1102' })] },
  expect: plain400('The body must be a JSON object.') });
add({ id: 'F12', group: 'failing', title: 'Content-Type text/plain', why: 'HTTP library default when the body is a string.',
  request: { method: 'POST', path: ORDERS, headers: { ...post(), 'Content-Type': 'text/plain' }, body: order() },
  expect: problem(415, 'unsupported_media_type', 'Unsupported media type', 'The request body must be application/json.') });
add({ id: 'F13', group: 'failing', title: 'Form-encoded body', why: 'Client posts the order like a web form.',
  request: { method: 'POST', path: ORDERS, headers: { ...post(), 'Content-Type': 'application/x-www-form-urlencoded' },
    raw_body: 'ref=TEST-PO-1013&pickup_address=1200+Example+Pkwy%2C+Elk+Grove+Village%2C+IL%2C+60007&pickup_date={{date:+3}}' },
  expect: problem(415, 'unsupported_media_type', 'Unsupported media type', 'The request body must be application/json.') });
{
  const h = post(); delete h['Idempotency-Key'];
  add({ id: 'F14', group: 'failing', title: 'No Idempotency-Key header', why: 'Client skips the header the docs require.',
    request: { method: 'POST', path: ORDERS, headers: h, body: order() },
    expect: plain400('The Idempotency-Key header is required: 8 to 100 characters.') });
}
add({ id: 'F15', group: 'failing', title: 'Idempotency-Key too short ("1015")', why: 'Client reuses a short sequence number.',
  request: { method: 'POST', path: ORDERS, headers: post('live', '1015'), body: order() },
  expect: plain400('The Idempotency-Key header is required: 8 to 100 characters.') });
{
  const o = order({ ref: 'TEST-PO-1016', pickup: { address: A.elk, date: '{{date:-1}}' }, delivery: { address: A.columbus, date: '{{date:+1}}' } });
  add({ id: 'F16', group: 'failing', title: 'Pickup date yesterday', why: 'Client resends a stale order from yesterday.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: placed(o),
    contract: { status: 400, errors: [{ field: 'pickup.date', code: 'date_in_past' }],
      note: 'Contract and pre-launch item 4: a pickup before today (US Central) is refused with date_in_past. The code has no such check and places the order.' },
    gap: 'accepts-what-it-should-refuse' });
}
{
  const o = order({ ref: 'TEST-PO-1017', pickup: { address: A.elk, date: '{{date:+5}}' }, delivery: { address: A.columbus, date: '{{date:+3}}' } });
  add({ id: 'F17', group: 'failing', title: 'Delivery date before pickup date', why: 'Client swaps the two dates.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o },
    expect: placed(o),
    contract: { status: 400, errors: [{ field: 'delivery.date', code: 'before_pickup' }],
      note: 'Contract and pre-launch item 4: a delivery before the pickup is refused with before_pickup. The code places the order.' },
    gap: 'accepts-what-it-should-refuse' });
}
add({ id: 'F18', group: 'failing', title: 'Pickup 366 days out (one past the ceiling)', why: 'Client books next year\'s recurring load one day too early.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 'TEST-PO-1018', pickup: { address: A.elk, date: '{{date:+366}}' }, delivery: { address: A.columbus, date: null } }) },
  expect: invalid([{ field: 'pickup.date', code: 'invalid_value', message: 'pickup.date is more than 365 days after today.',
    fix: 'Send pickup.date as {{date:+365}} or earlier, using the US Central calendar date.' }]) });
add({ id: 'F19', group: 'failing', title: 'Delivery in Texas (outside the 9-state zone)', why: 'Client sends a lane Moscoso does not run.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 'TEST-PO-1019', delivery: { address: A.dallas, date: '{{date:+5}}' } }) },
  expect: invalid([E.outside('delivery', 'TX')]) });
add({ id: 'F20', group: 'failing', title: 'Pickup in Pennsylvania (ruled out on 11-06)', why: 'PA has one lane on file but is not in the service area.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 'TEST-PO-1020', pickup: { address: A.pittsburgh, date: '{{date:+3}}' } }) },
  expect: invalid([E.outside('pickup', 'PA')]) });
add({ id: 'F21', group: 'failing', title: 'Both stops outside: California pickup, Ontario (Canada) delivery',
  why: 'Cross-border lane. Ruling 18: postal code in its own segment, then CA, reads Canada.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 'TEST-PO-1021', pickup: { address: A.sacramento, date: '{{date:+3}}' }, delivery: { address: A.toronto, date: '{{date:+6}}' } }) },
  expect: invalid([E.outside('pickup', 'CA'), E.outside('delivery', 'ON, CA')]) });
add({ id: 'F22', group: 'failing', title: 'Delivery in Nuevo Leon, Mexico', why: 'Ruling 15: CA and MX read only when certain, refused today.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: 'TEST-PO-1022', delivery: { address: A.monterrey, date: '{{date:+6}}' } }) },
  expect: invalid([E.outside('delivery', 'NL, MX')]) });
{
  const o = order({ ref: 'TEST-PO-1023', delivery: { address: A.dallasLower, date: '{{date:+5}}' } });
  add({ id: 'F23', group: 'failing', title: 'Out-of-zone state in lowercase ("dallas, tx")', why: 'Client lowercases addresses before sending.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o),
    note: 'Placed, by design: only an exact uppercase code can refuse (service_area.js stateOfSegment), so a lowercase out-of-zone code reads as unreadable and goes to review. The client is not told; a person must catch it in Requests.',
    gap: 'zone-slips-to-review' });
}
{
  const o = order({ ref: 'TEST-PO-1024', delivery: { address: A.austinName, date: '{{date:+5}}' } });
  add({ id: 'F24', group: 'failing', title: 'Out-of-zone state spelled out ("Austin, Texas")', why: 'Client writes full state names.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o),
    note: 'Placed, by design: a full state name can only read an allowed state. Goes to review; the client is not told.',
    gap: 'zone-slips-to-review' });
}
{
  const o = order({ ref: 'TEST-PO-1025', pickup: { address: A.zz, date: '{{date:+3}}' } });
  add({ id: 'F25', group: 'failing', title: 'Unknown state code (ZZ)', why: 'Typo or placeholder in the client address book.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o),
    note: 'Placed, by design: an unreadable state goes to review (contract InvalidOrder text says so). Nothing tells the client the address looked wrong.' });
}
{
  const o = order({ ref: 'TEST-PO-1026', pickup: { address: A.xx, date: '{{date:+3}}' } });
  add({ id: 'F26', group: 'failing', title: 'Unknown country code at the end (", XX")', why: 'Client appends its own country field.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: o }, expect: placed(o),
    note: 'Placed, by design: XX is neither a US state nor CA/MX, so the whole address reads as unreadable (even though Chicago, IL is in it) and goes to review.' });
}
add({ id: 'F27', group: 'failing', title: 'Equipment Moscoso does not run ("reefer")', why: 'Client asks for a refrigerated trailer.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ equipment: 'reefer' }) },
  expect: invalid([E.notAllowed('equipment', EQUIP)]) });
add({ id: 'F28', group: 'failing', title: 'Equipment as a display label ("Straight Truck")', why: 'Client sends the label from the docs table instead of the code.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ equipment: 'Straight Truck' }) },
  expect: invalid([E.notAllowed('equipment', EQUIP)]) });
{
  const stops = Array.from({ length: 25 }, (_, i) => ({ type: i ? 'delivery' : 'pickup', address: A.joliet, date: '{{date:+3}}' }));
  add({ id: 'F29', group: 'failing', title: 'Too many stops: a 25-stop array beside pickup and delivery', why: 'A milk-run client sends its whole route.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: order({ stops }) },
    expect: invalid([E.unknown('stops')]),
    note: 'There is no stops array and so no stop cap to test. The array is refused as one unknown field, however long.' });
}
{
  const extra = Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`custom_${String(i + 1).padStart(2, '0')}`, 'x']));
  add({ id: 'F30', group: 'failing', title: 'Too many problems: 60 unknown fields from a TMS record dump', why: 'Client posts its whole internal record.',
    request: { method: 'POST', path: ORDERS, headers: post(), body: { ...order(), ...extra } },
    expect: { status: 400, content_type: PROBLEM, body: { code: 'bad_request', detail: 'The request body has 60 problems. The first 50 are listed.' }, errors_count: 50 } });
}
add({ id: 'F31', group: 'failing', title: 'Oversize payload: notes of 70,000 characters', why: 'Client pastes an email thread into notes.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ notes: '{{fill:70000}}' }) },
  expect: problem(413, 'payload_too_large', 'Payload too large', 'The request body is over 64 KB.') });
add({ id: 'F32', group: 'failing', title: 'Text fields too long: ref 101, commodity 301, notes 2001 characters', why: 'Client concatenates several refs and descriptions.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ ref: '{{fill:101}}', commodity: '{{fill:301}}', notes: '{{fill:2001}}' }) },
  expect: invalid([E.tooLong('ref', STR(1, 100)), E.tooLong('commodity', STR(0, 300)), E.tooLong('notes', STR(0, 2000))]) });
add({ id: 'F33', group: 'failing', title: 'Pickup address too short ("IL"), delivery address all spaces', why: 'Client sends only a state, and a blank padded field.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pickup: { address: 'IL', date: '{{date:+3}}' }, delivery: { address: '      ', date: '{{date:+4}}' } }) },
  expect: invalid([E.tooShort('pickup.address', STR(5, 300)),
    { field: 'delivery.address', code: 'invalid_value', message: 'delivery.address is blank.', fix: fix('delivery.address', 'the street address of this stop') }]) });
add({ id: 'F34', group: 'failing', title: 'Spoofed client: client_id and client_code in the body', why: 'A platform tries to place an order for another client.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ client_id: 'cli_fx_prai', client_code: 'ZPG' }) },
  expect: invalid([E.unknown('client_id'), E.unknown('client_code')]) });
add({ id: 'F35', group: 'failing', title: 'Guessed stop fields: pickup.time and delivery.appointment', why: 'Client guesses field names from another carrier\'s API.',
  request: { method: 'POST', path: ORDERS, headers: post(), body: order({ pickup: { address: A.elk, date: '{{date:+3}}', time: '08:00' }, delivery: { address: A.columbus, date: '{{date:+4}}', appointment: true } }) },
  expect: invalid([E.unknown('pickup.time'), E.unknown('delivery.appointment')]) });
add({ id: 'F36', group: 'failing', title: 'Same Idempotency-Key reused with a different body', why: 'Client reuses a key after editing the order.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1036' }, '{{idem:dup}}')],
  request: { method: 'POST', path: ORDERS, headers: post('live', '{{idem:dup}}'), body: order({ ref: 'TEST-PO-1036', pieces: 14 }) },
  expect: problem(409, 'idempotency_conflict', 'Idempotency conflict', 'This Idempotency-Key was already used with a different body.') });
{
  const o = order({ ref: 'TEST-PO-1037' });
  add({ id: 'F37', group: 'failing', title: 'Same client ref sent twice with fresh Idempotency-Keys', why: 'Client regenerates the key on every retry.',
    setup: [{ method: 'POST', path: ORDERS, headers: post('live', '{{idem:first}}'), body: o, expect: { status: 201 }, save: { id: 'id' } }],
    request: { method: 'POST', path: ORDERS, headers: post('live', '{{idem:second}}'), body: o },
    expect: { ...placed(o), body_not: { id: '{{saved:id}}' } },
    note: 'Placed twice. Neither the code nor the contract treats ref as unique; only Idempotency-Key deduplicates. A client that regenerates keys creates duplicate orders.',
    gap: 'duplicate-ref' });
}
add({ id: 'F38', group: 'failing', title: 'DELETE /v1/orders', why: 'Client tries to clear its orders.',
  request: { method: 'DELETE', path: ORDERS, headers: auth('live') },
  expect: problem(405, 'method_not_allowed', 'Method not allowed', 'This path does not support that method.', { headers: { Allow: 'GET, POST' } }) });
add({ id: 'F39', group: 'failing', title: 'PATCH /v1/orders/{id} to edit an order', why: 'Client tries to change the pickup date after placing.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1039' })],
  request: { method: 'PATCH', path: `${ORDERS}/{{saved:id}}`, headers: { ...auth('live'), 'Content-Type': 'application/json' }, body: { pickup: { address: A.elk, date: '{{date:+6}}' } } },
  expect: problem(405, 'method_not_allowed', 'Method not allowed', 'This path does not support that method.', { headers: { Allow: 'GET' } }) });
add({ id: 'F40', group: 'failing', title: 'Cancel with PATCH (the superseded ruling 9 verb)', why: 'Client built against the 11-06 docs.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1040' })],
  request: { method: 'PATCH', path: `${ORDERS}/{{saved:id}}/cancel`, headers: auth('live') },
  expect: notFound(),
  contract: { status: 405, headers: { Allow: 'PUT' }, note: 'Contract documents 405 for this path. With no cancel route built, every method answers 404.' },
  gap: 'cancel-not-built' });
add({ id: 'F41', group: 'failing', title: 'No Authorization header', why: 'Client forgets to attach its key.',
  request: { method: 'POST', path: ORDERS, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': '{{idem}}' }, body: order() },
  expect: unauthorized() });
add({ id: 'F42', group: 'failing', title: 'Malformed Authorization ("Token ...")', why: 'Client uses another vendor\'s scheme.',
  request: { method: 'POST', path: ORDERS, headers: { ...post(), Authorization: 'Token {{key:live}}' }, body: order() },
  expect: unauthorized() });
add({ id: 'F43', group: 'failing', title: 'Revoked key', why: 'Client keeps using a key Moscoso revoked.',
  request: { method: 'POST', path: ORDERS, headers: post('revoked'), body: order() }, expect: unauthorized() });
add({ id: 'F44', group: 'failing', title: 'Expired key', why: 'Key passed its expiry date.',
  request: { method: 'POST', path: ORDERS, headers: post('expired'), body: order() }, expect: unauthorized() });
add({ id: 'F45', group: 'failing', title: 'Well-formed key that was never issued', why: 'Copy-paste error or a guessed key.',
  request: { method: 'POST', path: ORDERS, headers: post('unknown'), body: order() }, expect: unauthorized() });
add({ id: 'F46', group: 'failing', title: 'Key sent in the query string', why: 'Client copies the habit from another carrier\'s API.',
  request: { method: 'GET', path: `${ORDERS}?api_key={{key:live}}`, headers: auth('live') },
  expect: unauthorized('API keys are not accepted in a query string.') });
add({ id: 'F47', group: 'failing', title: 'Read-only key tries to place an order', why: 'Client uses its tracking key for orders.',
  request: { method: 'POST', path: ORDERS, headers: post('read_only'), body: order() },
  expect: problem(403, 'forbidden', 'Forbidden', 'This key lacks the required scope.') });
add({ id: 'F48', group: 'failing', title: 'Key of an inactive client account', why: 'Client account was closed.',
  request: { method: 'POST', path: ORDERS, headers: post('inactive_client'), body: order() },
  expect: problem(403, 'account_inactive', 'Account inactive', 'This client account is not active.') });
add({ id: 'F49', group: 'failing', title: 'Another client reads my order by id', why: 'Tenancy: a second client guesses REQ numbers.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1049' })],
  request: { method: 'GET', path: `${ORDERS}/{{saved:id}}`, headers: auth('other_client') },
  expect: notFound() });
add({ id: 'F50', group: 'failing', title: 'Test key reads a live order', why: 'Ruling 4 and the contract: a REQ- id answers 404 to a test key.',
  setup: [setupOrder('live', { ref: 'TEST-PO-1050' })],
  request: { method: 'GET', path: `${ORDERS}/{{saved:id}}`, headers: auth('test') },
  expect: { status: 200, content_type: JSONT, body: { id: '{{saved:id}}', ref: 'TEST-PO-1050' } },
  contract: { status: 404, note: 'Contract: a REQ- id answers 404 to a test key, and a test key never opens live tables. The code has no test mode, so the test key reads the live order.' },
  gap: 'accepts-what-it-should-refuse' });
add({ id: 'F51', group: 'failing', title: 'Order id that does not exist', why: 'Client mistypes the id.',
  request: { method: 'GET', path: `${ORDERS}/REQ-999999999`, headers: auth('live') }, expect: notFound() });
add({ id: 'F52', group: 'failing', title: 'List orders with an unknown status filter ("pending")', why: 'Client uses its own status word.',
  request: { method: 'GET', path: `${ORDERS}?status=pending`, headers: auth('live') }, expect: plain400('status is not an order status.') });
add({ id: 'F53', group: 'failing', title: 'List orders with page=2 instead of the cursor', why: 'Client assumes page-number paging.',
  request: { method: 'GET', path: `${ORDERS}?page=2`, headers: auth('live') }, expect: plain400('Unknown query parameter.') });
add({ id: 'F54', group: 'failing', title: 'POST /v1/orders?dry_run=true', why: 'Client hopes for a validate-only call (dropped from scope).',
  request: { method: 'POST', path: `${ORDERS}?dry_run=true`, headers: post(), body: order() }, expect: plain400('Unknown query parameter.') });
add({ id: 'F55', group: 'failing', title: 'Burst of 61 orders in under a minute on one key', why: 'Client flushes a backlog all at once. POST /v1/orders is limited to 60 a minute per key.',
  request: { method: 'POST', path: ORDERS, headers: post('rate_burst', '{{idem:n{{n}}}}'), body: order({ ref: 'TEST-PO-BURST-{{n}}' }), repeat: 61,
    expect_each_before_last: { status: 201 } },
  expect: problem(429, 'rate_limited', 'Too many requests', 'Too many requests. Try again later.', { headers: { 'Retry-After': '*' } }),
  note: 'Uses its own key so the other cases stay under the limit. The first 60 are placed.' });

// ------------------------------------------------------------------ write
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const ids = new Set();
for (const c of cases) {
  if (ids.has(c.id)) throw new Error(`duplicate id ${c.id}`);
  ids.add(c.id);
  const slug = c.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60).replace(/-$/, '');
  writeFileSync(join(OUT, `${c.id}-${slug}.json`), JSON.stringify(c, null, 2) + '\n');
}
const by = g => cases.filter(c => c.group === g).length;
console.log(`wrote ${cases.length} cases to ${OUT}: valid ${by('valid')}, contract-shape ${by('contract-shape')}, failing ${by('failing')}`);
