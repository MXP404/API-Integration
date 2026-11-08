#!/usr/bin/env node
// tests/fixtures/api-v1-orders/run.mjs — replays every case in cases/ against a LOCAL server
// and prints a pass/fail table.
//
//   node tests/fixtures/api-v1-orders/run.mjs                 # start a scratch server, run, stop
//   node tests/fixtures/api-v1-orders/run.mjs --only F16,F17  # some cases
//   node tests/fixtures/api-v1-orders/run.mjs --md out.md --json out.json
//   node tests/fixtures/api-v1-orders/run.mjs --base http://127.0.0.1:4600 --keys my-keys.json
//
// Default mode builds a brand-new SQLite database from db/schema.sql in a temp folder (no copy
// of any real data), starts app/server.js on it with API_V1_ENABLED=1 and every outside
// integration switched off (Slack, Google, Samsara, Maps, EIA, Gravity Forms, the API order
// alert), seeds three invented clients and their keys, runs the cases, then stops the server
// and deletes the folder (--keep keeps it). --base points at a server you started yourself; it
// must be on this machine (127.0.0.1, localhost or ::1), and --keys gives a JSON map of the key
// aliases the cases use (live, test, read_only, revoked, expired, inactive_client,
// other_client, rate_burst, unknown).
//
// Each case is judged three ways:
//   code      the answer matches `expect`, which is what app/api_v1.js on api-recut did when
//             the case was written (status, media type, headers, body, every field error).
//   contract  the answer matches `contract` where the case has one (what api/openapi.json
//             documents for that request), else the same status as `expect`.
//   schema    the body validates, in strict mode, against the schema api/openapi.json gives
//             for that operation and the status that came back.
// Exit code 0 only when every case passes `code`. Contract and schema results are reported,
// not enforced, because the contract is ahead of the code on purpose while the API is designed.
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawn, execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { createServer } from 'node:net';
import { DatabaseSync } from 'node:sqlite';
import { validate, resolveRef } from '../../contract/validate.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const argv = process.argv.slice(2);
const arg = n => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : undefined; };
const flag = n => argv.includes(n);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const sha256 = s => createHash('sha256').update(s).digest('hex');
const contract = JSON.parse(readFileSync(join(ROOT, 'api', 'openapi.json'), 'utf8'));

// ------------------------------------------------------------------ cases
const only = arg('--only') ? new Set(arg('--only').split(',').map(s => s.trim())) : null;
const GROUP_ORDER = { valid: 0, 'contract-shape': 1, failing: 2 };
const CASES_DIR = arg('--cases') || join(HERE, 'cases');
const cases = readdirSync(CASES_DIR).filter(f => f.endsWith('.json')).sort()
  .map(f => ({ file: f, ...JSON.parse(readFileSync(join(CASES_DIR, f), 'utf8')) }))
  .filter(c => !only || only.has(c.id))
  .sort((a, b) => (GROUP_ORDER[a.group] - GROUP_ORDER[b.group]) || a.id.localeCompare(b.id, 'en', { numeric: true }));
if (!cases.length) { console.error('no cases selected'); process.exit(2); }

// ------------------------------------------------------------------ server
const ALNUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const randomKey = prefix => prefix + [...randomBytes(32)].map(b => ALNUM[b % 62]).join('');
const ALL_SCOPES = 'orders:read orders:write capacity:read loads:read location:read docs:read';
const CLIENTS = [
  ['cli_fx_lake', 'ZLW', 'Lakeshore Widget Supply (test)', 'active'],
  ['cli_fx_prai', 'ZPG', 'Prairie Gadget Works (test)', 'active'],
  ['cli_fx_dorm', 'ZDX', 'Dormant Example Freight (test)', 'inactive'],
];
const USERS = [
  ['usr_fx_casey', 'casey.ops@example.com', 'Casey Example', 'cli_fx_lake'],
  ['usr_fx_robin', 'robin.ops@example.com', 'Robin Sample', 'cli_fx_prai'],
  ['usr_fx_dana', 'dana.idle@example.com', 'Dana Placeholder', 'cli_fx_dorm'],
];
// alias -> who holds it and what it can do. `unknown` is well formed and never stored.
const KEY_PLAN = {
  live: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: ALL_SCOPES },
  rate_burst: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: ALL_SCOPES },
  read_only: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: 'orders:read' },
  test: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: ALL_SCOPES, prefix: 'mx_test_' },
  revoked: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: ALL_SCOPES, revoked: true },
  expired: { user: 'usr_fx_casey', client: 'cli_fx_lake', scopes: ALL_SCOPES, expires: '2026-01-01T00:00:00Z' },
  inactive_client: { user: 'usr_fx_dana', client: 'cli_fx_dorm', scopes: ALL_SCOPES },
  other_client: { user: 'usr_fx_robin', client: 'cli_fx_prai', scopes: ALL_SCOPES },
  unknown: { stored: false },
};

function seed(dbPath) {
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA busy_timeout = 5000');
  const now = new Date().toISOString();
  const keys = {};
  try {
    db.exec('BEGIN');
    for (const [id, code, name, status] of CLIENTS) {
      db.prepare('INSERT INTO client (client_id, code, company_name, status) VALUES (?, ?, ?, ?)').run(id, code, name, status);
    }
    for (const [id, email, name, client] of USERS) {
      db.prepare(`INSERT INTO app_user (user_id, email, full_name, role, is_active, created_at, client_id)
        VALUES (?, ?, ?, 'client', 1, ?, ?)`).run(id, email, name, now, client);
    }
    let n = 0;
    for (const [alias, p] of Object.entries(KEY_PLAN)) {
      const key = randomKey(p.prefix || 'mx_live_');
      keys[alias] = key;
      if (p.stored === false) continue;
      db.prepare(`INSERT INTO api_key (key_id, user_id, client_id, prefix, key_hash, name, scopes, created_at, created_by, expires_at, revoked_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'fixture-runner', ?, ?)`)
        .run(`apik_fx_${++n}`, p.user, p.client, key.slice(0, 12), sha256(key), `fixture ${alias}`, p.scopes, now, p.expires || null, p.revoked ? now : null);
    }
    db.exec('COMMIT');
  } catch (e) { try { db.exec('ROLLBACK'); } catch { /* none open */ } throw e; } finally { db.close(); }
  return keys;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const s = createServer();
    s.once('error', reject);
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  });
}

let server = null, serverLog = '', scratch = null;
async function startScratchServer() {
  scratch = mkdtempSync(join(tmpdir(), 'moscoso-api-orders-'));
  const dbPath = join(scratch, 'platform.db');
  const uploads = join(scratch, 'uploads');
  mkdirSync(uploads);
  const db = new DatabaseSync(dbPath);
  db.exec(readFileSync(join(ROOT, 'db', 'schema.sql'), 'utf8'));
  db.close();
  const port = Number(arg('--port')) || await freePort();
  // A minimal environment: nothing from this shell beyond what node needs, so no token or
  // flag set elsewhere can reach the scratch server.
  const env = {
    PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR || tmpdir(), LANG: process.env.LANG || 'en_US.UTF-8',
    PLATFORM_DB: dbPath, PLATFORM_UPLOADS_DIR: uploads, PORT: String(port), BIND_HOST: '127.0.0.1',
    API_V1_ENABLED: '1', API_ORDER_ALERTS_ENABLED: '0', ALERTS_PAUSED: '1',
    SAMSARA_DISABLE: '1', GOOGLE_DISABLE: '1', SLACK_DISABLE: '1', MAPS_DISABLE: '1', EIA_DISABLE: '1', GF_DISABLE: '1',
    ORDERS_AUTOSYNC: 'off', APPLICATIONS_AUTOSYNC: 'off',
  };
  server = spawn(process.execPath, [join(ROOT, 'app', 'server.js')], { env, cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', d => { serverLog += d; });
  server.stderr.on('data', d => { serverLog += d; });
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 160; i++) {
    if (server.exitCode !== null) throw new Error(`server exited early\n${serverLog.slice(-3000)}`);
    try { const r = await fetch(`${base}/v1/me`); if (r.status === 401) break; } catch { /* not up yet */ }
    await sleep(250);
    if (i === 159) throw new Error(`server never answered /v1 (is API_V1_ENABLED honored?)\n${serverLog.slice(-3000)}`);
  }
  // api_key and app_user.client_id are created at boot, so the seed goes in after it.
  const keys = seed(dbPath);
  return { base, keys };
}
async function stopScratchServer() {
  if (server && server.exitCode === null) {
    server.kill('SIGTERM');
    for (let i = 0; i < 20 && server.exitCode === null; i++) await sleep(100);
    if (server.exitCode === null) server.kill('SIGKILL');
  }
  if (arg('--server-log')) writeFileSync(arg('--server-log'), serverLog);
  if (scratch && !flag('--keep')) rmSync(scratch, { recursive: true, force: true });
  else if (scratch) console.log(`scratch kept: ${scratch}`);
}

// ------------------------------------------------------------------ tokens
function centralDate(offsetDays) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const [y, m, d] = today.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + offsetDays)).toISOString().slice(0, 10);
}
const RUN_ID = `${Date.now().toString(36)}${randomBytes(2).toString('hex')}`;
function resolve(value, ctx) {
  if (typeof value === 'string') {
    let s = value.replace(/\{\{n\}\}/g, String(ctx.n ?? 0));
    s = s.replace(/\{\{(key|date|idem|saved|fill)(?::([^}]*))?\}\}/g, (all, kind, a) => {
      switch (kind) {
        case 'key': if (!(a in ctx.keys)) throw new Error(`no key alias ${a}`); return ctx.keys[a];
        case 'date': return centralDate(Number(a));
        case 'idem': return `fx-${RUN_ID}-${ctx.caseId}${a ? `-${a}` : ''}`;
        case 'saved': if (!(a in ctx.saved)) throw new Error(`nothing saved as ${a}`); return ctx.saved[a];
        case 'fill': return 'x'.repeat(Number(a));
        default: return all;
      }
    });
    return s;
  }
  if (Array.isArray(value)) return value.map(v => resolve(v, ctx));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, ctx)]));
  return value;
}

// ------------------------------------------------------------------ HTTP, paced under the limits
// The contract's per-key limits. Cases other than the burst stay a little under them, so a
// limit only ever trips where a case tests it.
const LIMITS = { 'POST /v1/orders': 60, 'GET /v1/orders': 20, 'GET /v1/orders/{id}': 120, 'PUT /v1/orders/{id}/cancel': 20 };
const MASTER = 300;
const hits = new Map();
const endpointOf = (method, path) => `${method} ${path.split('?')[0].replace(/^(\/v1\/(?:orders|docs)\/)[^/]+/, '$1{id}')}`;
const recent = id => { const a = (hits.get(id) || []).filter(t => Date.now() - t < 60000); hits.set(id, a); return a; };
async function pace(keyAlias, method, path) {
  if (!keyAlias) return;
  const e = endpointOf(method, path);
  for (;;) {
    const roomMaster = recent(keyAlias).length < MASTER - 10;
    const roomEndpoint = !(e in LIMITS) || recent(`${keyAlias}|${e}`).length < LIMITS[e] - 3;
    if (roomMaster && roomEndpoint) break;
    await sleep(500);
  }
}
function note(keyAlias, method, path) {
  if (!keyAlias) return;
  const e = endpointOf(method, path);
  for (const id of [keyAlias, `${keyAlias}|${e}`]) recent(id).push(Date.now());
}
const aliasOf = (headers, keys) => {
  const h = Object.entries(headers || {}).find(([k]) => k.toLowerCase() === 'authorization');
  if (!h) return null;
  return Object.keys(keys).find(a => h[1].includes(keys[a])) || null;
};

async function send(base, step, ctx, { paced = true } = {}) {
  const method = step.method;
  const path = resolve(step.path, ctx);
  const headers = resolve(step.headers || {}, ctx);
  let body;
  if (step.raw_body !== undefined) body = resolve(step.raw_body, ctx);
  else if (step.body !== undefined) body = JSON.stringify(resolve(step.body, ctx));
  const alias = aliasOf(headers, ctx.keys);
  if (paced) await pace(alias, method, path);
  note(alias, method, path);
  const res = await fetch(base + path, { method, headers, body, redirect: 'manual' });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not JSON */ }
  return { status: res.status, headers: res.headers, text, json, method, path };
}

// ------------------------------------------------------------------ comparison
const media = r => (r.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
const at = (obj, dotted) => dotted.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
function partial(actual, expected, where, out) {
  if (expected !== null && typeof expected === 'object' && !Array.isArray(expected)) {
    if (actual === null || typeof actual !== 'object' || Array.isArray(actual)) { out.push(`${where}: expected an object, got ${JSON.stringify(actual)}`); return; }
    for (const [k, v] of Object.entries(expected)) partial(actual[k], v, where ? `${where}.${k}` : k, out);
    return;
  }
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) { out.push(`${where}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); return; }
    expected.forEach((v, i) => partial(actual[i], v, `${where}[${i}]`, out));
    return;
  }
  if (actual !== expected) out.push(`${where}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}
const errKey = (e, full) => (full ? JSON.stringify([e.field, e.code, e.message, e.fix]) : JSON.stringify([e.field, e.code]));

// `full` errors: the exact list (as a multiset). Otherwise errors must at least contain these field+code pairs.
function compare(exp, r, { fullErrors }) {
  const out = [];
  if (exp.status !== undefined && r.status !== exp.status) out.push(`status ${r.status}, expected ${exp.status}`);
  if (exp.content_type && media(r) !== exp.content_type) out.push(`content-type ${media(r) || '(none)'}, expected ${exp.content_type}`);
  for (const [k, v] of Object.entries(exp.headers || {})) {
    const got = r.headers.get(k);
    if (v === '*' ? got == null : got !== v) out.push(`header ${k}: ${got == null ? '(absent)' : JSON.stringify(got)}, expected ${v === '*' ? 'present' : JSON.stringify(v)}`);
  }
  if (exp.body) { if (r.json == null) out.push('body is not JSON'); else partial(r.json, exp.body, '', out); }
  for (const [p, re] of Object.entries(exp.body_match || {})) {
    const v = r.json == null ? undefined : at(r.json, p);
    if (v === undefined || !new RegExp(re).test(String(v))) out.push(`${p}: ${JSON.stringify(v)} does not match /${re}/`);
  }
  for (const [p, t] of Object.entries(exp.body_types || {})) {
    const v = r.json == null ? undefined : at(r.json, p);
    const kind = Array.isArray(v) ? 'array' : v === null ? 'null' : typeof v;
    if (kind !== t) out.push(`${p}: is ${kind}, expected ${t}`);
  }
  for (const [p, v] of Object.entries(exp.body_not || {})) {
    if (r.json != null && at(r.json, p) === v) out.push(`${p}: should differ from ${JSON.stringify(v)}`);
  }
  const actualErrs = (r.json && Array.isArray(r.json.errors)) ? r.json.errors : null;
  if (exp.no_errors && actualErrs) out.push(`errors present: ${JSON.stringify(actualErrs).slice(0, 300)}`);
  if (exp.errors_count !== undefined && (actualErrs ? actualErrs.length : 0) !== exp.errors_count) out.push(`errors: ${actualErrs ? actualErrs.length : 0} items, expected ${exp.errors_count}`);
  if (exp.errors) {
    const got = (actualErrs || []).map(e => errKey(e, fullErrors));
    const want = exp.errors.map(e => errKey(e, fullErrors));
    const left = [...got];
    const missing = want.filter(w => { const i = left.indexOf(w); if (i < 0) return true; left.splice(i, 1); return false; });
    if (missing.length) out.push(`missing errors: ${missing.join(' ')}`);
    if (fullErrors && left.length) out.push(`unexpected errors: ${left.join(' ')}`);
  }
  return out;
}

// The contract operation for a method and concrete path, or null.
function contractOp(method, path) {
  const p = path.split('?')[0];
  for (const [tmpl, item] of Object.entries(contract.paths)) {
    const re = new RegExp(`^${tmpl.replace(/\{[^}]+\}/g, '[^/]+')}$`);
    if (re.test(p)) return item[method.toLowerCase()] ? { tmpl, op: item[method.toLowerCase()] } : { tmpl, op: null };
  }
  return null;
}
function schemaCheck(r) {
  const found = contractOp(r.method, r.path);
  if (!found) return { verdict: 'n/a', detail: 'path not in contract' };
  if (!found.op) return { verdict: 'n/a', detail: `${r.method} not in contract for ${found.tmpl}` };
  let spec = found.op.responses[String(r.status)];
  if (!spec) return { verdict: 'FAIL', detail: `contract documents no ${r.status} for ${found.op.operationId}` };
  if (spec.$ref) spec = resolveRef(contract, spec.$ref);
  const content = spec.content || {};
  const m = media(r);
  if (!(m in content)) return { verdict: 'FAIL', detail: `content-type ${m || '(none)'} not documented (${Object.keys(content).join(', ')})` };
  if (!content[m].schema || r.json == null) return { verdict: 'PASS', detail: '' };
  const errs = validate(contract, content[m].schema, r.json, { strict: true });
  return errs.length ? { verdict: 'FAIL', detail: errs.slice(0, 6).join('; ') } : { verdict: 'PASS', detail: '' };
}

// ------------------------------------------------------------------ run one case
async function runCase(base, c, keys) {
  const ctx = { keys, saved: {}, caseId: c.id, n: 0 };
  const result = { id: c.id, group: c.group, title: c.title, gap: c.gap || null, file: c.file };
  try {
    for (const step of c.setup || []) {
      const r = await send(base, step, ctx);
      if (step.expect && r.status !== step.expect.status) throw new Error(`setup ${step.method} ${r.path} answered ${r.status}, expected ${step.expect.status}: ${r.text.slice(0, 300)}`);
      for (const [name, p] of Object.entries(step.save || {})) ctx.saved[name] = at(r.json || {}, p);
    }
    const req = c.request;
    const repeat = req.repeat || 1;
    let r, earlier = [];
    for (let n = 1; n <= repeat; n++) {
      ctx.n = n;
      r = await send(base, req, ctx, { paced: repeat === 1 });
      if (n < repeat && req.expect_each_before_last && r.status !== req.expect_each_before_last.status) earlier.push(`call ${n}: ${r.status}`);
    }
    const exp = resolve(c.expect, ctx);
    const codeProblems = compare(exp, r, { fullErrors: true });
    if (earlier.length) codeProblems.unshift(`earlier calls not ${req.expect_each_before_last.status}: ${earlier.slice(0, 5).join(', ')}`);
    const cexp = c.contract ? resolve(c.contract, ctx) : { status: exp.status };
    const contractProblems = compare(cexp, r, { fullErrors: false });
    const schema = schemaCheck(r);
    Object.assign(result, {
      expected_status: exp.status, actual_status: r.status,
      contract_status: cexp.status,
      code: codeProblems.length ? 'FAIL' : 'PASS', code_detail: codeProblems.join('; '),
      contract: contractProblems.length ? 'FAIL' : 'PASS', contract_detail: contractProblems.join('; '),
      contract_note: c.contract?.note || null, note: c.note || null,
      schema: schema.verdict, schema_detail: schema.detail,
      body: r.text.length > 1500 ? `${r.text.slice(0, 1500)}…` : r.text,
    });
  } catch (e) {
    Object.assign(result, { code: 'ERROR', code_detail: String(e.message || e), contract: '-', schema: '-' });
  }
  return result;
}

// ------------------------------------------------------------------ report
const pad = (s, n) => (String(s).length > n ? `${String(s).slice(0, n - 1)}…` : String(s).padEnd(n));
function table(results) {
  const lines = [];
  lines.push(`${pad('ID', 4)} ${pad('group', 14)} ${pad('case', 58)} ${pad('exp', 4)} ${pad('got', 4)} ${pad('code', 5)} ${pad('contract', 8)} ${pad('schema', 6)}`);
  lines.push('-'.repeat(110));
  for (const r of results) {
    lines.push(`${pad(r.id, 4)} ${pad(r.group, 14)} ${pad(r.title, 58)} ${pad(r.expected_status ?? '-', 4)} ${pad(r.actual_status ?? '-', 4)} ${pad(r.code, 5)} ${pad(r.contract, 8)} ${pad(r.schema, 6)}`);
  }
  return lines.join('\n');
}
const mdCell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
function markdown(results, meta) {
  const out = [];
  out.push(`Run ${meta.when} against ${meta.base} (${meta.mode}), checkout at commit ${meta.commit}. Code: ${meta.code}. Contract: ${meta.contract}. Schema: ${meta.schema}.`, '');
  out.push('| ID | Group | Case | Expected | Got | Code | Contract (want) | Schema | Gap |');
  out.push('|---|---|---|---|---|---|---|---|---|');
  for (const r of results) {
    out.push(`| ${r.id} | ${r.group} | ${mdCell(r.title)} | ${r.expected_status ?? '-'} | ${r.actual_status ?? '-'} | ${r.code} | ${r.contract}${r.contract_status !== undefined && r.contract_status !== r.expected_status ? ` (${r.contract_status})` : ''} | ${r.schema} | ${r.gap || ''} |`);
  }
  const details = results.filter(r => r.code !== 'PASS' || r.contract === 'FAIL' || r.schema === 'FAIL');
  if (details.length) {
    out.push('', 'Details for every case that did not pass all three:', '');
    for (const r of details) {
      out.push(`- **${r.id}** ${mdCell(r.title)}`);
      if (r.code !== 'PASS') out.push(`  - code: ${mdCell(r.code_detail)}`);
      if (r.contract === 'FAIL') out.push(`  - contract: ${mdCell(r.contract_detail)}`);
      if (r.schema === 'FAIL') out.push(`  - schema: ${mdCell(r.schema_detail)}`);
    }
  }
  return out.join('\n') + '\n';
}

// ------------------------------------------------------------------ main
async function main() {
  let base, keys, mode;
  if (arg('--base')) {
    base = arg('--base').replace(/\/+$/, '');
    const host = new URL(base).hostname;
    if (!['127.0.0.1', 'localhost', '[::1]', '::1'].includes(host)) {
      console.error(`refusing ${base}: this runner only talks to a server on this machine, never production or a deployed server`);
      process.exit(2);
    }
    if (!arg('--keys')) { console.error('--base needs --keys <json map of key aliases>'); process.exit(2); }
    keys = JSON.parse(readFileSync(arg('--keys'), 'utf8'));
    mode = 'existing local server';
  } else {
    ({ base, keys } = await startScratchServer());
    mode = 'scratch server, fresh DB from db/schema.sql';
  }
  console.log(`api-v1-orders: ${cases.length} cases against ${base} (${mode})\n`);
  const results = [];
  try {
    for (const c of cases) {
      const r = await runCase(base, c, keys);
      results.push(r);
      const mark = r.code === 'PASS' ? 'ok  ' : r.code === 'ERROR' ? 'ERR ' : 'FAIL';
      console.log(`${mark} ${r.id} ${r.title}${r.code !== 'PASS' ? `\n       ${r.code_detail}` : ''}`);
    }
  } finally {
    if (!arg('--base')) await stopScratchServer();
  }
  const count = (k, v) => results.filter(r => r[k] === v).length;
  let commit = 'unknown';
  try { commit = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { /* git not available */ }
  const meta = {
    when: new Date().toISOString().replace(/\.\d{3}Z$/, 'Z'), base, mode, commit,
    code: `${count('code', 'PASS')} pass, ${count('code', 'FAIL')} fail, ${count('code', 'ERROR')} error`,
    contract: `${count('contract', 'PASS')} match, ${count('contract', 'FAIL')} differ`,
    schema: `${count('schema', 'PASS')} pass, ${count('schema', 'FAIL')} fail, ${count('schema', 'n/a')} n/a`,
  };
  console.log(`\n${table(results)}\n`);
  console.log(`code: ${meta.code}   contract: ${meta.contract}   schema: ${meta.schema}`);
  if (arg('--json')) writeFileSync(arg('--json'), JSON.stringify({ meta, results }, null, 2) + '\n');
  if (arg('--md')) writeFileSync(arg('--md'), markdown(results, meta));
  process.exit(count('code', 'PASS') === results.length ? 0 : 1);
}
main().catch(async e => { console.error(e); await stopScratchServer().catch(() => {}); process.exit(2); });
