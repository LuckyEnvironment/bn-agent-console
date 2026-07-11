# CI — Handbook ⇄ Agent Card coverage

`handbook-coverage.test.js` verifies that the Handbook (the instruction/safety layer)
and the Agent Card (the runtime instance) speak the same vocabulary. It is the guardrail
behind the claim "the Handbook is enforceable."

## Run

```sh
node ci/handbook-coverage.test.js                    # human report, exit 1 on failure
node ci/handbook-coverage.test.js --json ci/coverage-report.json   # + machine report
node ci/handbook-coverage.test.js --soft             # report only, never exit non-zero
```

No dependencies — Node built-ins only (tested on Node 22).

## What it checks

1. **FORWARD** — every `machineFields` reference in `handboek/data.ts` resolves to a real
   field on the rendered card (`assets/agents-data.js`) or the manifest schema
   (`schemas/agent-manifest.schema.json`), directly or via an alias in `field-map.json`.
2. **REVERSE** — every runtime enforcement field (`field-map.json → enforcementFields`)
   is named by at least one article. A control the runtime blocks on but no article names
   is ungoverned.
3. **XREF** — every `verwijzingen` ("Art. X.Y") points to an article that exists.

## Field map

`field-map.json` is the bridge config:

- `aliases` — "same meaning, different name/shape" (drift that is mapped but should be
  unified). Should shrink to zero once the canonical schema from `RECONCILIATION-MEMO.md`
  lands.
- `_knownGaps` — documentation only; the machineFields intentionally left unmapped so they
  report as UNRESOLVED. Do not add fake aliases to silence them.
- `enforcementFields` — fields the runtime uses to block/allow a call, in the vocabulary
  the current card actually carries.

## Current baseline (pre-reconciliation)

The test currently **FAILS by design**: 4 resolved, 13 aliased, 24 unresolved, 4 ungoverned
enforcement fields (the fourth is the v2.1 connector-pin gate, which no Handbook article
governs yet — memo §2.4). That is the drift the reconciliation memo closes. Wire the test
into CI now in `--soft` mode to track the number down, then flip to hard-fail once the
memo's migration steps 1 and 3 are done.

`coverage-report.json` is a committed snapshot, not a live artifact: regenerate it with
`--json ci/coverage-report.json` whenever the handbook, card data, schema or field map
changes, or it silently goes stale.
