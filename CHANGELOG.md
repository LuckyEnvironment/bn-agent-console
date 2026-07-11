# Changelog

## 2026-07-11 — Dynamic Autonomous Escrow: autonomie als standaard (Boek VIII Titel 11)

### Toegevoegd
- **Dynamisch mandaat.** Elke Tier A/B/C-agent werkt binnen een realtime mandaat
  langs drie dimensies: per-transactielimiet, uurcapaciteit (token bucket, continu
  hervuld) en gevoelige data per minuut. Effectief mandaat = `basis(tier) × α`,
  met α strikt afgeleid van de bestaande Vertrouwensscore (Art. 8.31 lid 3 — géén
  eigen reputatiecurve). Binnen het mandaat: directe autonome uitvoering, geen
  toetsingsmoment vooraf. Erbuiten: transactie aangehouden voor hervulling
  (`retryAfterSeconds`) of asynchrone menselijke validatie via het bestaande
  approvals-mechanisme; de agent blijft door werken. Tier D blijft normatief op
  goedkeuring per transactie (Art. 8.15 lid 3); bij schorsing vervalt het mandaat
  van rechtswege; borg = maximaal de uurcapaciteit (Art. 8.34).
- **Handboek Boek VIII Titel 11** (Art. 8.31–8.34) met `machineFields`
  `bna.mandate.*` — de nieuwe handhavingsvelden zijn vanaf dag één genormeerd:
  de coverage-test toont ze als GOVERNED (FORWARD 4 → 10 resolved).
- **Platform (`bn-agent`):** migratie `0003_deb_budget.sql` (state-tabel +
  atomaire `bna_budget_debit`-RPC met row lock en continue hervulling; nieuwe
  status `blocked_budget_exceeded`; kolommen `amount_cents`/`payload_bytes`/
  `mandate_at_submission`) en `server/budget.ts` (mandaatberekening, debit,
  budgetstatus). `server/escrow.ts` omgebouwd: de **caller-declared
  `aboveThreshold` is verwijderd** — de drempel wordt server-side gemeten
  (Art. 8.33 lid 3); geldige approval passeert de bucket als validatie.
- **API:** `GET /v1/escrow/budget/{agentId}` (scope `escrow:read`) — realtime
  mandaat en saldo; `POST /v1/escrow/requests` accepteert `amountCents` en
  `payloadBytes`, antwoordt 201 binnen mandaat en 202 met restsaldo en
  vervolginstructie erbuiten.
- **Agent Card:** `mandate`-blok op elke kaart (berekend in de merge, zelfde
  formule als server-side); detailpagina toont het mandaat in het escrow-paneel,
  incl. nihil-mandaat met grond (Tier D / geschorst).

## 2026-07-11 — Connector-integriteit: manifest-hashing, pins en runtime-handhaving (v2.1)

### Toegevoegd
- **Manifest-ondertekening.** `connector.schema.json` krijgt een `integrity`-blok
  (`manifestHash` SHA-256 + `signedAt`), uitsluitend gezet door de pipeline en afwezig
  zolang de connector `in validatie` is. Alle 45 ondertekende connectors in
  `connectors-data.js` dragen het blok; demodata deterministisch:
  `manifestHash = SHA-256("connector|" + connectorId + "|" + version)`.
  De catalogus toont hash + ondertekendatum per connector.
- **Connector-pins op de Agent Card.** Ooit ondertekende kaarten (status
  geldig/gebroken) pinnen per koppeling `(connectorId, version, manifestHash)` in
  `integrity.connectorPins` — 11 agents, gesnapshot bij ondertekening en gedekt door
  de `card_hash`. Nieuwe helper `bnVerifyConnectorPins` vergelijkt pins met de
  actuele catalogus (geldig / gebroken / niet gepind / onbekend). De detailpagina
  toont pinstatus per koppeling, een pin-regel in het integriteitspaneel en een
  hervalidatie-waarschuwing bij breuk. **Pin-breukdemo:** `bna:agent:fleet-link-019`
  pint RDW Voertuiggegevens v2.9.0 waar de catalogus v3.0.0 voert.
- **Runtime-handhaving.** Nieuwe route `POST /v1/connectors/{id}/invoke`
  (scope `connectors:invoke`, altijd namens een agent) met bindende controlevolgorde:
  kaart geldig (403) → connector actief (409) → pin-match (409, hervalidatie) →
  scope-subset (422). Vierde veiligheidsklep `CONNECTOR_LIVE_INVOCATION` (default
  uit): controles draaien wél, doorzetting niet — verificatieresultaat komt terug
  met 503. Auditschema: optioneel `connector_manifest_hash` op `input_sources`
  (de door de proxy geverifieerde hash); beide connector-verwijzende voorbeeldentries
  bijgewerkt (ketenformule ongewijzigd). MCP-server 2.1.0 met tool
  `verify_connector_pins`.

### Gewijzigd
- Docs: derde verifieerbaarheidsregel (pin-breuk), subsectie "Integriteit:
  manifest-hash & connector-pins", invoke-endpoint, veldreferenties connector
  (`integrity`) en Agent Card (`integrity.connectorPins`), logvelden-categorie B.
- `ARCHITECTURE.md`: integriteitsketen van de koppelingslaag + vierde klep.

## 2026-07-11 — Connectorcatalogus uitgebreid naar 51 connectors

### Toegevoegd
- **40 nieuwe voorbeeldconnectors** in `assets/connectors-data.js` (totaal 51), allemaal
  bestaande NL/BE/EU-stelsels en -diensten, verdeeld over 11 nieuwe rubrieken naast de
  bestaande zeven: Vastgoed & kadaster (BAG, KIK, WOZ), Overheid & justitie (BRP Haal
  Centraal, Justis VOG, DUO, Rechtspraak ECLI, Berichtenbox), Verzekeren (SIVI AFS,
  CIS), HR & payroll (Nmbrs, Visma Raet), Zorg (MedMij, VECOZO), Documenten &
  ondertekenen (ValidSign, Peppol), Communicatie & berichten (Bird), Logistiek &
  e-commerce (PostNL), Data & statistiek (CBS StatLine, Euronext), Compliance &
  sanctielijsten (EU-sanctielijst), Energie & duurzaamheid (EDSN P4); plus
  uitbreidingen van Registers (RDW, KBO, UBO-register, VIES), Krediet & identiteit
  (itsme, EUDI Wallet, Creditsafe, Signicat), Betalen (PSD2 AIS/PIS, Mollie,
  SEPA-incasso), Boekhouding (AFAS, Twinfield, Moneybird, SAP) en Mobiliteit & IoT (NS).
  Statusspreiding: 44 actief, 6 in validatie (o.a. BRP, PSD2 PIS, MedMij — hoogste
  risicobijdragen), 1 gedeprecieerd (screen-scraping, verboden onder de PSD2-RTS).
- **12 agents kregen passende koppelingen** (26 connectors zijn nu daadwerkelijk aan
  agents gekoppeld): o.a. KYC-agent → UBO-register + EU-sanctielijst + VIES,
  CV-screening → DUO-diplomaverificatie + Justis VOG, Verzuimsignalering → Nmbrs +
  Visma Raet, Huurindexatie → CBS StatLine (CPI), WOZ-taxatie → WOZ-waardeloket +
  BAG. Uitsluitend connectors met status `actief` en uitsluitend binnen de bestaande
  links-invariant; geen enkele `riskBreakdown` is gewijzigd.

### Geverifieerd
- Alle 51 connectors gevalideerd tegen `connector.schema.json` (draft 2020-12, ajv);
  unieke id's, bestaande referenties, alleen-actief-gekoppeld en beide
  Boek VIII-invarianten programmatisch gecontroleerd; catalogus-, detail- en
  consolepagina gerenderd in headless Chrome zonder console-errors.

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
