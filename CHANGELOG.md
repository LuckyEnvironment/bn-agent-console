# Changelog

## 2026-07-10 — Agent Card v1.1, WORM-audittrail, publieke check (plan 10/7)

### Toegevoegd
- **Agent Card Standaard v1.1** in `assets/agents-data.js`: vier datablokken per agent
  (`functional`, `architecture`, `guardrails`, `complianceCheck`), integriteitsblok
  (`codeHash`/`cardHash` als echte SHA-256-digests, ondertekeningsstatus, check-URL) en
  risico-barometer `riskLevel` 1–5. Uitbreiding wordt in de basisdataset gemerged.
- **Agent-detailpagina** toont de volledige v1.1-kaart: risico-barometer, vier
  datablok-panelen, HITL-trigger, hostingmodel en integriteitspaneel met hash-breukregel.
- **`bn-agent-audit-trail.html`** — auditor-dashboard op het WORM-logboek: filterbare
  transactietabel, detailweergave langs de vier waarborgen (onweerlegbaarheid, lineage,
  HITL, compliance), ruwe JSON per entry, export en live ketenverificatie via
  `crypto.subtle`.
- **`assets/audit-data.js`** — 8 voorbeeldtransacties (APPROVED, REJECTED, OVERRIDE en
  autonome leveringen, incl. DORA-afwijking met herstelpad), alle schema-valide en
  hash-geketend.
- **`bn-agent-check.html`** — publieke certificaatcheck (doel van het "Powered by
  BN Agent"-watermerk): certificerings- en integriteitsstatus, risiconiveau/tier,
  audittrail-verwijzing en optionele transactieverificatie via `?tx=`.
- **`schemas/`** — `audit-log-entry.schema.json` en `agent-manifest.schema.json`
  (JSON Schema 2020-12) met gevalideerde voorbeelden in `schemas/examples/`.
- **API-routes** — `v1/audit/logs` (POST ingest + GET query),
  `v1/audit/logs/[id]` (entry + ketenbewijs) en `v1/check/[id]` (publiek), in de stijl
  van de bestaande registry-/escrow-routes incl. scopes en feature flag
  `AUDIT_WORM_BACKEND`.
- **Certificeringspagina** — validatiepipeline in drie stappen (digitale keuring,
  kwetsbaarheidsscan, generatie & ondertekening), hash-breuk-callout en de twee
  hostingmodellen (Optie A hosted / Optie B BYOC).
- **Docs** — datablokken-veldreferentie v1.1, Audit API, certificaatcheck, de vier
  verplichte logveld-categorieën (A–D) en schema-downloads.
- Repodocumentatie: `README.md`, `ARCHITECTURE.md`, `DECISIONS.md`, dit changelog.

### Gewijzigd
- Navigatie op alle pagina's geüniformeerd (Home / Registry / Certificering /
  Audit-trail / Docs / Console-demo); dode "Kennisbank"-links vervangen door Audit-trail.
- `index.html` hersteld uit git (was verwijderd; alle pagina's linken ernaar).
- Versielabels Agent Card v1.0 → v1.1 op detailpagina en docs.

### Geverifieerd
- Alle JS-gedreven pagina's gerenderd in headless Chrome met inhoudscontroles
  (detailkaart, audittrail, checkpagina in drie toestanden, docs, certificering, registry,
  console); interne links gescand; schema's en alle voorbeelddata gevalideerd met
  `jsonschema` (draft 2020-12); inline scripts syntaxgecontroleerd met `node --check`.
