#!/usr/bin/env node
/*
 * BN Agent — Handbook ⇄ Agent Card coverage test
 * -------------------------------------------------
 * Turns "the Handbook IS the enforceable instruction/safety layer" from a claim
 * into something CI verifies on every commit.
 *
 * It runs three checks:
 *
 *   1. FORWARD  — every `machineFields` reference in the Handbook (handboek/data.ts)
 *                 must resolve to a real field on the Agent Card, either the
 *                 rendered card (assets/agents-data.js) or the manifest schema
 *                 (schemas/agent-manifest.schema.json). Directly, or via an
 *                 explicit alias declared in ci/field-map.json.
 *
 *   2. REVERSE  — every runtime ENFORCEMENT field (a field the platform uses to
 *                 block/allow an agent call) must trace back to at least one
 *                 Handbook article. A field the runtime enforces on but no article
 *                 names is an ungoverned control.
 *
 *   3. XREF     — every `verwijzingen` ("Art. X.Y") points to an article that
 *                 actually exists. Catches dangling cross-references.
 *
 * No external dependencies — Node built-ins only (fs, path, vm).
 *
 * Usage:
 *   node ci/handbook-coverage.test.js            # human report, exit 1 on failure
 *   node ci/handbook-coverage.test.js --json out.json   # also write machine report
 *   node ci/handbook-coverage.test.js --soft     # never exit non-zero (report only)
 *
 * Exit code 0 = all checks pass, 1 = at least one FORWARD/REVERSE/XREF failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const HANDBOOK = path.join(ROOT, 'handboek', 'data.ts');
const AGENTS = path.join(ROOT, 'assets', 'agents-data.js');
const SCHEMA = path.join(ROOT, 'schemas', 'agent-manifest.schema.json');
const FIELDMAP = path.join(__dirname, 'field-map.json');

const args = process.argv.slice(2);
const SOFT = args.includes('--soft');
const jsonIdx = args.indexOf('--json');
const JSON_OUT = jsonIdx !== -1 ? args[jsonIdx + 1] : null;

// ─────────────────────────────────────────────────────────────────────────────
// Normalisation: collapse the three vocabularies (bna.* / snake_case / camelCase)
// onto one comparable key so a "match" means the same logical field, not the same
// spelling. Strips a leading `bna.` namespace, lowercases, removes underscores and
// array markers `[]`. Dots (structure) are preserved on purpose: a path that lives
// at a different depth is a real mismatch, not a spelling one.
// ─────────────────────────────────────────────────────────────────────────────
function norm(p) {
  return String(p)
    .replace(/^bna\./, '')
    .replace(/\[\]/g, '')
    .replace(/_/g, '')
    .toLowerCase();
}

// ── Load Handbook articles by evaluating the data.ts array literal ──────────────
// data.ts is: an `import type` line, a comment, `export const BOEKEN: Boek[] = [...]`,
// then two `export function`s. We slice off the functions, strip the TS-only bits,
// and evaluate the remaining pure array literal. Far more robust than regex.
function loadHandbook() {
  let src = fs.readFileSync(HANDBOOK, 'utf8');
  const cut = src.indexOf('export function');
  if (cut !== -1) src = src.slice(0, cut);
  src = src.replace(/^\s*import[^\n]*\n/m, '');
  src = src.replace(/export const BOEKEN\s*:\s*Boek\[\]\s*=\s*/, 'return ');
  const boeken = new Function(src + '\n')();

  const articles = [];
  for (const boek of boeken) {
    for (const titel of boek.titels || []) {
      for (const art of titel.artikelen || []) {
        articles.push({
          nr: art.nr,
          titel: art.titel,
          boek: boek.nr,
          machineFields: art.machineFields || [],
          verwijzingen: art.verwijzingen || [],
        });
      }
    }
  }
  return articles;
}

// ── Enumerate every field path present on the RENDERED Agent Card ───────────────
// agents-data.js assigns onto `window` and merges BN_CARD_EXTENSIONS at the end.
// We run it in a sandbox and walk the union of paths across all cards.
function loadCardPaths() {
  const code = fs.readFileSync(AGENTS, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: 'agents-data.js' });
  const agents = sandbox.window.BN_AGENTS || [];

  const paths = new Set();
  const walk = (obj, prefix) => {
    if (obj === null || typeof obj !== 'object') return;
    if (Array.isArray(obj)) {
      // Represent element structure as prefix[]; recurse into object elements.
      paths.add(prefix + '[]');
      for (const el of obj) {
        if (el && typeof el === 'object' && !Array.isArray(el)) walk(el, prefix + '[]');
      }
      return;
    }
    for (const [k, v] of Object.entries(obj)) {
      const p = prefix ? prefix + '.' + k : k;
      paths.add(p);
      walk(v, p);
    }
  };
  for (const a of agents) walk(a, '');
  return paths;
}

// ── Enumerate every field path declared by the MANIFEST JSON SCHEMA ─────────────
function loadSchemaPaths() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA, 'utf8'));
  const paths = new Set();
  const walk = (node, prefix) => {
    if (!node || typeof node !== 'object') return;
    if (node.properties) {
      for (const [k, v] of Object.entries(node.properties)) {
        const p = prefix ? prefix + '.' + k : k;
        paths.add(p);
        walk(v, p);
      }
    }
    if (node.items) {
      paths.add(prefix + '[]');
      walk(node.items, prefix + '[]');
    }
  };
  walk(schema, '');
  return paths;
}

// ─────────────────────────────────────────────────────────────────────────────
function main() {
  const articles = loadHandbook();
  const cardPaths = loadCardPaths();
  const schemaPaths = loadSchemaPaths();
  const fieldMap = fs.existsSync(FIELDMAP)
    ? JSON.parse(fs.readFileSync(FIELDMAP, 'utf8'))
    : { aliases: {}, enforcementFields: [] };
  const aliases = fieldMap.aliases || {};
  const enforcementFields = fieldMap.enforcementFields || [];

  // Normalised lookup sets for the two "available" surfaces.
  const cardNorm = new Set([...cardPaths].map(norm));
  const schemaNorm = new Set([...schemaPaths].map(norm));
  const availNorm = new Set([...cardNorm, ...schemaNorm]);

  const resolve = (field) => {
    const n = norm(field);
    if (cardNorm.has(n)) return { status: 'RESOLVED', via: 'card', target: field };
    if (schemaNorm.has(n)) return { status: 'RESOLVED', via: 'schema', target: field };
    if (aliases[field]) {
      const t = aliases[field];
      const tn = norm(t);
      if (cardNorm.has(tn)) return { status: 'ALIASED', via: 'card', target: t };
      if (schemaNorm.has(tn)) return { status: 'ALIASED', via: 'schema', target: t };
      return { status: 'BROKEN_ALIAS', via: null, target: t };
    }
    return { status: 'UNRESOLVED', via: null, target: null };
  };

  // ── Check 1: FORWARD coverage ────────────────────────────────────────────────
  const forward = [];
  const seen = new Set();
  for (const art of articles) {
    for (const field of art.machineFields) {
      const key = art.nr + '::' + field;
      if (seen.has(key)) continue;
      seen.add(key);
      forward.push({ article: art.nr, title: art.titel, field, ...resolve(field) });
    }
  }
  const fwdFail = forward.filter((r) => r.status === 'UNRESOLVED' || r.status === 'BROKEN_ALIAS');
  const fwdAlias = forward.filter((r) => r.status === 'ALIASED');
  const fwdOk = forward.filter((r) => r.status === 'RESOLVED');

  // ── Check 2: REVERSE coverage (enforcement fields → article) ──────────────────
  // Build the set of every field any article names (normalised, incl. alias targets).
  const governed = new Set();
  for (const art of articles) {
    for (const f of art.machineFields) {
      governed.add(norm(f));
      if (aliases[f]) governed.add(norm(aliases[f]));
    }
  }
  const reverse = enforcementFields.map((ef) => {
    const field = typeof ef === 'string' ? ef : ef.field;
    const note = typeof ef === 'string' ? '' : ef.note || '';
    return { field, note, governed: governed.has(norm(field)) };
  });
  const revFail = reverse.filter((r) => !r.governed);

  // ── Check 3: XREF integrity (verwijzingen point to real articles) ────────────
  const artNrs = new Set(articles.map((a) => a.nr));
  const xref = [];
  for (const art of articles) {
    for (const ref of art.verwijzingen) {
      // "Art. 8.11" / "Art. 8.4 lid 2" / "Art. 8.16 lid 2" → take the numeric head.
      const m = String(ref).match(/(\d+\.\d+)/);
      const target = m ? m[1] : null;
      const exists = target ? artNrs.has(target) : false;
      if (!exists) xref.push({ from: art.nr, ref, target });
    }
  }

  // ── Report ───────────────────────────────────────────────────────────────────
  const bar = '─'.repeat(78);
  const P = (s = '') => console.log(s);
  P(bar);
  P('BN Agent — Handbook ⇄ Agent Card coverage test');
  P(bar);
  P(`Handbook articles parsed : ${articles.length}`);
  P(`Machine-field references  : ${forward.length} (unique article×field)`);
  P(`Rendered card paths       : ${cardPaths.size}`);
  P(`Manifest schema paths     : ${schemaPaths.size}`);
  P(`Alias entries loaded      : ${Object.keys(aliases).length}`);
  P();

  P('① FORWARD — Handbook machineFields must resolve to a card/schema field');
  P(`   RESOLVED ${fwdOk.length}   ALIASED ${fwdAlias.length}   FAILED ${fwdFail.length}`);
  if (fwdAlias.length) {
    P('   ── aliased (drift: article and field disagree on name/shape) ──');
    for (const r of fwdAlias) P(`   ~ ${r.article.padEnd(6)} ${r.field}  →  ${r.target}`);
  }
  if (fwdFail.length) {
    P('   ── FAILED (no field exists — the norm points at nothing) ──');
    for (const r of fwdFail) {
      const why = r.status === 'BROKEN_ALIAS' ? `alias→${r.target} (missing)` : 'unresolved';
      P(`   ✗ ${r.article.padEnd(6)} ${r.field}   [${why}]`);
    }
  }
  P();

  P('② REVERSE — runtime enforcement fields must trace to an article');
  P(`   GOVERNED ${reverse.length - revFail.length}   UNGOVERNED ${revFail.length}`);
  for (const r of reverse) {
    const mark = r.governed ? '✓' : '✗';
    P(`   ${mark} ${r.field}${r.note ? '  — ' + r.note : ''}`);
  }
  P();

  P('③ XREF — verwijzingen must point to existing articles');
  if (xref.length === 0) {
    P('   ✓ all cross-references resolve');
  } else {
    for (const x of xref) P(`   ✗ Art. ${x.from} → "${x.ref}" (no such article)`);
  }
  P();

  const failed = fwdFail.length > 0 || revFail.length > 0 || xref.length > 0;
  P(bar);
  P(failed ? 'RESULT: FAIL' : 'RESULT: PASS');
  P(bar);

  if (JSON_OUT) {
    const report = {
      generatedAt: new Date().toISOString(),
      totals: {
        articles: articles.length,
        forwardRefs: forward.length,
        cardPaths: cardPaths.size,
        schemaPaths: schemaPaths.size,
      },
      forward,
      reverse,
      xref,
      result: failed ? 'FAIL' : 'PASS',
    };
    fs.writeFileSync(JSON_OUT, JSON.stringify(report, null, 2));
    P(`JSON report written to ${JSON_OUT}`);
  }

  if (failed && !SOFT) process.exit(1);
}

main();
