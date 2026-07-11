# Changelog

## 2026-07-11 — Platform v2: connectorlaag, Agent Card v2.0, registry-uitbreiding

### Toegevoegd
- **Connectorlaag (Connector Standaard v1.0).** Systeemconnectors zijn gecertificeerde
  koppelingen naar externe systemen met een eigen manifest:
  `schemas/connector.schema.json` (JSON Schema 2020-12) met gevalideerd voorbeeld in
  `schemas/examples/connector.example.json`. Velden: `connectorId`, `authType`
  (oauth2/apiKey/mtls), maximale `scopes`, `dataCategories`, `dataResidency`,
  `zeroDataRetention`, `riskContribution` (0–100) en `status`.
- **`assets/connectors-data.js`** — single source of truth met 11 voorbeeldconnectors
  (KVK Handelsregister, BKR, iDIN, iDEAL, DigiD, eHerkenning, Microsoft Graph,
  Salesforce, Exact Online, OCPI-laadinfra, generieke REST/webhook), incl. hulpfuncties
  `bnConnectorById` en `bnAgentsForConnector`.
- **`bn-agent-connectors.html`** — doorzoekbare connectorcatalogus (zoeken + filters op
  authenticatietype, categorie en status, aria-labels en live resultaatteller) in de
  stijl van de registry-preview; navigatie-item "Connectors" op alle pagina's.
- **Agent Card Standaard v2.0** — één nieuw veld t.o.v. v1.1: `connectorIds`
  (verwijzingen `bnc:connector:*`). Nieuwe invariant in `agents-data.js`:
  `riskBreakdown.links >= max(riskContribution)` van de gekoppelde connectors.
  Detailpagina toont een connectorpaneel met authenticatietype, residentie en
  risicobijdrage per koppeling.
- **Negen nieuwe voorbeeldagents** in zes nieuwe sectoren: Zorgtriage (Annex III) en
  Declaratiecontrole (Zorg), Woo-lakassistent en Vergunningcheck (Overheid, Annex III),
  Contract Review (Legal), Schadeclaim Intake (Verzekeringen), Verzuimsignalering
  (HR, Annex III, `aangemeld`), WOZ-taxatie en Huurindexatie (Vastgoed). Alle
  Boek VIII-gewichten sluiten exact (invariant 1) en beide hostingmodellen en alle
  certificeringstoestanden zijn vertegenwoordigd. Hashes v2-batch deterministisch:
  `SHA-256("code|"+agentId+"|"+version)` resp. `"card|"…`.
- **Hash-breukdemonstratie** — `bna:agent:huurindex-063` staat `geschorst` met
  integriteitsstatus `gebroken`: detail-, check- én registrypagina tonen nu de
  volledige bevriezingsflow naast `niet ondertekend` (cv-screen-025).
- **API-routes** — `v1/connectors` (GET zoeken publiek; POST achter scope
  `connectors:write`) en `v1/connectors/[id]` (GET met veldfiltering per aanroeper),
  in de stijl van de registry-/escrow-routes. Derde veiligheidsklep
  `CONNECTOR_LIVE_CREDENTIALS` (default uit): payloads met credentials worden
  categorisch geweigerd (422). MCP-server (`v1/[transport]`) uitgebreid met
  `find_connectors` en `get_connector`; serverversie 2.0.0.
- **Auditschema** — optioneel veld `connector_id` op `data_lineage.input_sources`
  zodat elke connector-aanroep traceerbaar in de WORM-trail landt; twee
  voorbeeldentries verwijzen nu naar een connector (hashketen ongewijzigd — de
  ketenformule hasht alleen tx/timestamp/prev).
- **Console-demo** — nieuwe view "Systeemconnectors" (catalogustabel met
  risicobijdrage en gebruikende agents), gevoed uit `connectors-data.js`.
- **Docs** — sectie Connectors (veldreferentie manifest, authenticatietypen,
  residency-afhandeling, credential-regel) en sectie Connectors API; veldreferentie
  Agent Card aangevuld met `connectorIds`; schema-downloads uitgebreid.

### Gewijzigd
- `agent-manifest.schema.json`: `manifest_version` accepteert `1.1` én `2.0`;
  optioneel `architecture.connector_ids` toegevoegd; voorbeeld bijgewerkt naar 2.0.
- Versielabels Agent Card v1.1/v1.0 → v2.0 op detailpagina, registry, certificering,
  homepage en docs; `ARCHITECTURE.md` uitgebreid met laag 6 (connectorcatalogus),
  de derde veiligheidsklep en een v2-notitie; `DECISIONS.md` beslissingen 13–20.
- Registry-preview: aria-labels op zoekveld en filters, `aria-live` op de
  resultaatteller (consistent met de nieuwe cataloguspagina).

### Geverifieerd
- Alle JS-gedreven pagina's gerenderd in headless Chrome met inhoudscontroles en nul
  console-errors (registry met 19 agents, detailpagina's incl. connectorpaneel en
  `gebroken`-status, connectorcatalogus met filters, checkpagina, audittrail met live
  ketenverificatie, console incl. Systeemconnectors-view, docs, certificering);
  interne links gescand; alle schema's en voorbeelden gevalideerd met `jsonschema`
  (draft 2020-12); beide Boek VIII-invarianten en de hashketen programmatisch
  gecontroleerd; inline scripts syntaxgecontroleerd met `node --check`.

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
