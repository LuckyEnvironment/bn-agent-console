# BN Agent — architectuur

## Lagen

```
                        ┌────────────────────────────────────────────┐
  ontwikkelaar ───────▶ │ Certificeringspipeline (CI/CD-poortwachter)│
  (agent + manifest)    │ 1 digitale keuring  2 pentest  3 signing   │
                        └───────────────┬────────────────────────────┘
                                        │ code_hash + card_hash
                                        ▼
  afnemers ──────────▶ ┌──────────────────────┐      ┌──────────────────────┐
  (console, API)       │  Discovery Registry  │◀────▶│  Escrow-laag         │
                       │  Agent Cards v1.1    │      │  data tussen agents  │
                       └──────────┬───────────┘      └──────────┬───────────┘
                                  │                             │
                                  ▼                             ▼
  publiek ───────────▶ ┌──────────────────────┐      ┌──────────────────────┐
  (watermerk-check)    │  /check/{id}         │      │  WORM-audittrail     │
                       │  certificaatcheck    │◀─────│  hash-geketende logs │
                       └──────────────────────┘      └──────────────────────┘
```

1. **Certificeringspipeline.** De ontwikkelaar dient agentcode + `agent-manifest.json` in
   (schema: `schemas/agent-manifest.schema.json`). Stap 1 valideert claims geautomatiseerd
   (serverregio vs. `data_residency`, zero-retention-vlag vs. `zero_data_retention`);
   stap 2 voert prompt-injection-pentests en (voor Annex III) bias-audits uit; stap 3
   genereert de Agent Card en ondertekent code én kaart met SHA-256-hashes, vastgelegd in
   de audittrail. Eén regel code wijzigen breekt de `code_hash` → kaart ongeldig → agent
   bevroren tot hervalidatie.

2. **Discovery Registry.** Doorzoekbaar op capability, sector, tier, certificeringsstatus.
   Elke agent publiceert een Agent Card v2.0 met vier datablokken (functional,
   architecture, guardrails, complianceCheck), integriteitsblok, risico-barometer 1–5 en
   (v2.0) `connectorIds` — verwijzingen naar gecertificeerde systeemconnectors.

3. **Escrow-laag.** Gecontroleerde data-uitwisseling tussen agents; de aanbieder legt
   minimumscore en doelbinding vast, elke levering krijgt een `response_hash` en landt in
   de audittrail van bron én afnemer.

4. **WORM-audittrail.** Agents pushen bij taakafronding een `audit-log-entry`
   (schema: `schemas/audit-log-entry.schema.json`) via een beveiligde HTTPS/gRPC-stream.
   Opslag is immutable (AWS QLDB / Azure Immutable Blob); elke entry bevat de hash van de
   vorige zodat manipulatie detecteerbaar is — ook door de platformbeheerder. Vier
   waarborgen per entry: onweerlegbaarheid, traceerbaarheid (incl. chain-of-thought),
   human-in-the-loop (Wft-zorgplicht, verplichte override-motivatie + digitale
   handtekening) en compliance-integriteit (AVG-masking, DORA-status).

5. **Publieke check.** Het watermerk "Geproduceerd via een BN-compliant agent" onder
   klantdocumenten verwijst naar `be-an-agent.nl/check/{id}` — certificaatstatus,
   hash-integriteit en (met `?tx=`) transactieverificatie, zonder authenticatie. Dit is
   tevens het groeimechanisme: elk gedeeld document is een verifieerbare aanbeveling.

6. **Connectorcatalogus (v2).** Systeemconnectors zijn gecertificeerde koppelingen naar
   externe systemen (iDIN, KVK Handelsregister, DigiD, eHerkenning, Microsoft Graph,
   Salesforce, …) met een eigen manifest (`schemas/connector.schema.json`): authType
   (oauth2/apiKey/mtls), maximale scopes, datacategorieën, dataresidentie,
   zero-data-retention en een `riskContribution` (0–100). Agents declareren hun
   connectors via `connectorIds` op de Agent Card; de pipeline dwingt af dat
   `riskBreakdown.links` ten minste de hoogste `riskContribution` van de gekoppelde
   connectors is. Elke daadwerkelijke aanroep via een connector landt als
   `input_source` met `connector_id` in de WORM-audittrail, zodat de auditor per
   transactie ziet welke externe systemen zijn geraakt. Credentials staan nooit in het
   register: geheimen leven uitsluitend in de kluis van de hostingomgeving.

## Hostingmodellen (per agent, veld `architecture.hosting`)

- **Optie A — hosted.** Agentcode in de centrale bibliotheek; per lease start het platform
  een volledig afgesloten container (Docker/Kubernetes) in een gereserveerde VPC/Secure
  Enclave (Azure/AWS). Multi-tenant-isolatie: data van bureau X raakt nooit bureau Y.
- **Optie B — byoc.** Platform is marktplaats + controlekamer; de gecertificeerde code
  wordt in de cloudomgeving van de afnemer geïnstalleerd. Data en executie blijven binnen
  de eigen muren; audit-metadata streamt naar het platformregister.

## Technische opzet van deze repository

- **Site:** statische HTML met gedeelde design-tokens (`assets/bn-tokens.css`), geen
  buildstap. Data-gedreven pagina's lezen `assets/agents-data.js` en
  `assets/audit-data.js`.
- **API:** `v1/` bevat Next.js App Router-routes met Nederlandse domeinfouten en
  scope-gebaseerde autorisatie (OAuth 2.1 client credentials). Ze verwijzen naar
  `@/lib/api`, `@/server/{auth,registry,escrow,audit,connectors}` — de domeinlaag van de
  platform-app waarin deze routes gemount worden. Endpoints: registry (zoeken, kaart,
  verify), escrow (requests, approvals), audit (`POST/GET /v1/audit/logs`,
  `GET /v1/audit/logs/{tx}`), publieke check (`GET /v1/check/{id}`), connectors
  (`GET/POST /v1/connectors`, `GET /v1/connectors/{id}` met veldfiltering per
  aanroeper), oauth, sectors, capabilities, handboek, leads.
- **Schema's:** JSON Schema draft 2020-12, gevalideerd in de pipeline (manifest,
  connector) en bij ingest (audit). Voorbeelden in `schemas/examples/` valideren in CI.

## Platform v2 (juli 2026)

v2 voegt de connectorlaag toe en verbreedt de registry naar zes extra sectoren (Zorg,
Overheid, Legal, Verzekeringen, HR, Vastgoed). De Agent Card Standaard gaat van v1.1
naar v2.0: één nieuw veld (`connectorIds`), alle v1.1-velden ongewijzigd —
v1.1-manifesten blijven geldig (`manifest_version` accepteert `1.1` en `2.0`). De twee
bestaande Boek VIII-invarianten blijven staan; v2 voegt er één toe:
`riskBreakdown.links >= max(riskContribution)` van de gekoppelde connectors.

## Veiligheidskleppen & feature flags

| Vlag | Effect |
| --- | --- |
| `ESCROW_LIVE_PROCESSING` (default uit) | Escrow-payloads met mogelijk cliëntgevoelige data worden categorisch geweigerd (422); alleen `requestMeta` wordt aangenomen. |
| `AUDIT_WORM_BACKEND` (default uit) | Zonder geconfigureerde WORM-backend geeft de Audit API 503, zodat een agent nooit "stil" zonder audittrail draait. |
| `CONNECTOR_LIVE_CREDENTIALS` (default uit) | `POST /v1/connectors` accepteert uitsluitend het manifest; payloads met `credentials`/`secrets`/`apiKey` worden categorisch geweigerd (422). Geheimen leven in de kluis van de hostingomgeving, nooit in het register. |

Beide bewaken dezelfde regel: het platform raakt geen cliëntgevoelige data aan voordat de
juridische en technische randvoorwaarden aantoonbaar staan.
