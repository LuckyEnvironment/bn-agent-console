// BN Agent — dataverificatie (CI + lokaal).
// Controleert de invarianten die de site en de docs beloven:
//   1. riskFactor === gewogen som van riskBreakdown (Boek VIII)
//   2. riskBreakdown.links >= max(riskContribution) van de gekoppelde connectors
//   3. connectorIds verwijzen naar bestaande connectors
//   4. elke api-input_source in de audittrail heeft een geldig connector_id dat
//      (indien de agent in de preview-registry staat) op diens Agent Card staat
//   5. WORM-hashketen: entry_hash = SHA-256(tx | timestamp | prev ?? "genesis")
//   6. v2-batch: codeHash/cardHash = SHA-256("code|"/"card|" + agentId + "|" + version)
// Gebruik: node scripts/verify-data.mjs [--export DIR]
// --export schrijft agents/connectors/audit als JSON weg voor schemavalidatie.
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const require = createRequire(import.meta.url);
globalThis.window = {};
require("../assets/agents-data.js");
require("../assets/connectors-data.js");
require("../assets/audit-data.js");
const { BN_AGENTS, BN_CONNECTORS, BN_AUDIT_LOG, BN_RISK_MODEL } = window;

const sha256 = (s) => createHash("sha256").update(s).digest("hex");
let failures = 0;
const fail = (msg) => { failures++; console.error("FAIL " + msg); };
const ok = (msg) => console.log("ok   " + msg);

// 1. Boek VIII: gewogen som
const W = BN_RISK_MODEL.weights;
for (const a of BN_AGENTS) {
  const sum = Object.keys(W).reduce((s, k) => s + a.riskBreakdown[k] * W[k], 0);
  if (Math.abs(sum - a.riskFactor) > 1e-9) {
    fail(`invariant 1: ${a.agentId} gewogen som ${sum} != riskFactor ${a.riskFactor}`);
  }
}
ok(`invariant 1 — gewogen risicosom (${BN_AGENTS.length} agents)`);

// 2 + 3. links-ondergrens en referentiële integriteit
for (const a of BN_AGENTS) {
  const connectors = (a.connectorIds || []).map((id) => {
    const c = window.bnConnectorById(id);
    if (!c) fail(`invariant 3: ${a.agentId} verwijst naar onbekende connector ${id}`);
    return c;
  }).filter(Boolean);
  if (connectors.length) {
    const maxRC = Math.max(...connectors.map((c) => c.riskContribution));
    if (a.riskBreakdown.links < maxRC) {
      fail(`invariant 2: ${a.agentId} links ${a.riskBreakdown.links} < max riskContribution ${maxRC}`);
    }
  }
}
ok("invariant 2+3 — links-ondergrens en connectorreferenties");

// 4. audittrail: api-bronnen dragen een geldig connector_id
for (const e of BN_AUDIT_LOG) {
  const tx = e.log_header.transaction_id;
  const agent = window.bnAgentById(e.identities.agent.agent_id);
  for (const s of e.data_lineage.input_sources) {
    if (s.source_type !== "api") continue;
    if (!s.connector_id) { fail(`audit ${tx}: api-bron '${s.provider}' zonder connector_id`); continue; }
    if (!window.bnConnectorById(s.connector_id)) {
      fail(`audit ${tx}: onbekende connector ${s.connector_id}`);
    }
    if (agent && !(agent.connectorIds || []).includes(s.connector_id)) {
      fail(`audit ${tx}: ${s.connector_id} staat niet op de Agent Card van ${agent.agentId}`);
    }
  }
}
ok(`audittrail — connector_id op alle api-bronnen (${BN_AUDIT_LOG.length} entries)`);

// 5. WORM-hashketen
let prev = null;
for (const e of BN_AUDIT_LOG) {
  const h = e.log_header;
  const expected = sha256(`${h.transaction_id}|${h.timestamp}|${prev ?? "genesis"}`);
  if (expected !== e.integrity_chain.entry_hash) fail(`keten: entry_hash mismatch bij ${h.transaction_id}`);
  if (e.integrity_chain.prev_entry_hash !== prev) fail(`keten: prev_entry_hash mismatch bij ${h.transaction_id}`);
  prev = e.integrity_chain.entry_hash;
}
ok("WORM-hashketen — volledig naverekend");

// 6. deterministische hashes van de v2-batch (zie DECISIONS.md #18)
const V2_BATCH = [
  "bna:agent:triage-zorg-041", "bna:agent:decl-check-042", "bna:agent:woo-redact-045",
  "bna:agent:vergunning-check-048", "bna:agent:contract-review-051", "bna:agent:claim-intake-054",
  "bna:agent:verzuim-signal-057", "bna:agent:woz-taxatie-060", "bna:agent:huurindex-063",
];
for (const id of V2_BATCH) {
  const a = window.bnAgentById(id);
  if (!a) { fail(`v2-batch: ${id} niet gevonden`); continue; }
  if (a.integrity.codeHash !== sha256(`code|${id}|${a.version}`)) fail(`v2-batch: codeHash mismatch ${id}`);
  if (a.integrity.cardHash !== null && a.integrity.cardHash !== sha256(`card|${id}|${a.version}`)) {
    fail(`v2-batch: cardHash mismatch ${id}`);
  }
}
ok(`v2-hashformule — ${V2_BATCH.length} agents`);

// --export DIR: JSON-dumps voor schemavalidatie
const exportIdx = process.argv.indexOf("--export");
if (exportIdx !== -1) {
  const dir = process.argv[exportIdx + 1];
  if (!dir) { fail("--export vereist een directory"); }
  else {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "agents.json"), JSON.stringify(BN_AGENTS, null, 1));
    writeFileSync(join(dir, "connectors.json"), JSON.stringify(BN_CONNECTORS, null, 1));
    writeFileSync(join(dir, "audit.json"), JSON.stringify(BN_AUDIT_LOG, null, 1));
    ok(`export — JSON-dumps naar ${dir}`);
  }
}

if (failures) { console.error(`\n${failures} verificatiefout(en)`); process.exit(1); }
console.log("\nAlle dataverificaties geslaagd.");
