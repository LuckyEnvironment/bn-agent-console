# BNA — technisch adviesplan (marketplace, bidding, compliance-gateway)

Status: advies, 2026-07-20. Toetst de productvisie (directory-aggregatie, Trust Matrix,
Verification Seal, RFQ/bidding met micro-metered billing, compliance-gateway met
PII-redactie, immutable ledger, liability isolation) tegen de huidige codebase
(platform v2: registry, Agent Card v2.0, connectorlaag, WORM-audittrail, drie
veiligheidskleppen) en zet een gefaseerde bouwroute uit.

---

## 1. Waar de visie al op fundament staat

| Visie-pijler | Bestaat vandaag (v2) | Dekkingsgraad |
| --- | --- | --- |
| Unified Directory | Discovery Registry + Agent Card v2.0 + `agent-manifest.schema.json` | Datamodel ja; **crawler/federatie nee** |
| Trust Matrix | Boek VIII: statische risicofactor + dynamische trustScore + tiers A–D | Model ja; **live metriek-ingest nee** |
| Verification Seal | Certificeringspipeline, code/card-hashes, `verify_agent` (JWS EdDSA gepland), publieke check | Concept ja; **sleutelbeheer/revocatie nee** |
| Escrow & cash flow | Escrow-laag (metadata, tier-gating, `minScoreRequired`), klep `ESCROW_LIVE_PROCESSING` | Protocol ja; **geld nee** |
| Immutable Audit Trail | WORM-hashketen, auditschema met `connector_id`-plicht, ketenbewijs-API | Sterk; **externe verankering nee** |
| Compliance-gateway | Connectorlaag (residency, scopes, riskContribution), PII-masking als kaartclaim | Declaratief ja; **runtime-afdwinging nee** |

De strategische kern klopt: het platform is ontworpen als *control plane* (wie mag wat,
onder welke voorwaarden, met welk bewijs). Wat de visie toevoegt is een *data plane*
(verkeer loopt écht door de gateway) en een *money plane* (RFQ, bidding, settlement).
Die drie moeten architectonisch gescheiden blijven — dat is het belangrijkste
structuuradvies van dit document.

---

## 2. Advies per pijler

### A. Unified Directory Mapping (crawler + federatie)

**Doel.** `/.well-known/agent-card.json` crawlen, verifiëren en indexeren.

**Advies.**
1. Adopteer het A2A-protocol als *extern* formaat en definieer een verliesvrije mapping
   A2A AgentCard ↔ BNA Agent Card v2.0. Niet forken: BNA-velden (Boek VIII-scores,
   certificering, `connectorIds`) zijn een *overlay* die BNA zelf zet — nooit uit de
   gecrawlde bron overnemen (principe "geverifieerd, geen zelfverklaring" geldt ook hier).
2. Crawlerpipeline in drie stadia, elk met eigen status in de registry:
   `ontdekt` (gecrawld, alleen A2A-velden, expliciet ongecertificeerd getoond) →
   `geclaimd` (aanbieder bewijst domeinbezit via DNS-challenge of well-known-token) →
   `gecertificeerd` (bestaande pipeline). De registry toont ontdekte agents alleen
   met een duidelijk "niet geverifieerd"-watermerk, anders ondergraaft de crawl de seal.
3. Versheid en intrekking: elke gecrawlde kaart krijgt `fetchedAt`, `sourceHash` en een
   TTL; verdwijnt de bron of wijzigt de hash zonder hercertificering, dan degradeert de
   status automatisch (zelfde bevriezingsmechaniek als de code-hash-breuk).
4. Bouw dit nu al als schema: `discovered-agent.schema.json` + statusveld-uitbreiding.
   De crawler zelf is platform-app-werk (queue + fetcher + validator), geen site-werk.

### B. Trust Matrix (live scoring)

**Doel.** Ranking op transactievolume, uptime, foutpercentages.

**Advies.**
1. De enige verdedigbare bron voor trustScore is de **eigen audittrail** — metrics die
   de aanbieder zelf rapporteert zijn zelfverklaring. Dat betekent: trustScore wordt een
   afgeleide van WORM-entries (volume, `system_integrity.error_count`, responstijden,
   HITL-uitkomsten, `dora_incident_status`). Definieer de aggregatieformule publiek,
   net zoals de Boek VIII-gewichten publiek zijn; een ranking die je niet kunt uitleggen
   is voor enterprises geen trust-signaal maar een black box.
2. Cold start: nieuwe agents zonder historie krijgen géén "gemiddelde" score maar een
   expliciete band `onvoldoende historie` (n < drempel transacties). Nooit interpoleren.
3. Gaming-resistentie: volume weegt logaritmisch, zelf-transacties (zelfde
   `organization_id` aan beide kanten) tellen niet mee, en scoreverval bij inactiviteit
   (bijv. halfwaardetijd 90 dagen) voorkomt dat een agent op oude glorie blijft ranken.
4. Quick win in deze repo: leg de aggregatieformule vast in de docs en laat
   `scripts/verify-data.mjs` controleren dat voorbeelddata-trustMetrics consistent zijn
   met de gerapporteerde trustScore-klasse.

### C. Verification Seal ("Certified Clean"-token)

**Doel.** Cryptografisch bewijs dat een agent gevalideerd is.

**Advies.**
1. Het bestaande ontwerp (JWS EdDSA-attestatie via `verify_agent`, publieke sleutel op
   `/.well-known/jwks.json`) is de juiste vorm. Maak de attestatie kort-levend
   (uren, niet maanden) en bind hem aan `code_hash` + `card_hash` + tier: een seal die
   een oude codeversie dekt is waardeloos en gevaarlijk.
2. Sleutelbeheer is het echte werk: signing-keys in een HSM/KMS met rotatieplan,
   en een gepubliceerde revocatielijst (of status-endpoint) zodat een geschorste agent
   (huurindex-063-scenario) binnen minuten wereldwijd zijn seal verliest — niet pas
   bij TTL-verloop.
3. Overweeg een transparantielog (Certificate Transparency-model): elke uitgegeven en
   ingetrokken seal append-only gepubliceerd. Dat maakt de claim "BNA kan zelf niet
   sjoemelen" verifieerbaar en versterkt precies het WORM-verhaal dat er al ligt.

### D. Marketplace: RFQ, bidding, micro-metered billing

**Doel.** Client-agent post RFQ, vendor-agents bieden algoritmisch, BNA int 1–3% fee.

**Advies.**
1. Bouw dit als drie gescheiden contracten, elk met eigen schema en WORM-logging:
   `rfq` (taak, budgetkader, deadline, compliance-eisen), `bid` (prijs, prijsmodel,
   capaciteitsclaim, geldigheid), `award/settlement` (winnaar, meetafspraak,
   uitbetalingsconditie). Elke statusovergang is een audit-entry — het bestaande
   schema kan dit dragen met een nieuw `market`-blok of een apart
   `market-event.schema.json` dat naar transactie-id's verwijst.
2. Prijsmodellen faseren: Pay-Per-Inference/Token eerst (meetbaar uit de gateway zelf),
   **Performance-Based Bonuses laatst**. "Betaal $0,20 per extra 1% verbetering" vereist
   een onafhankelijke meetbron (oracle-probleem): wie stelt de 5% vast, met welke data,
   en wat bij dispuut? Zonder geformaliseerde meetafspraak + arbitrageflow is dit een
   geschillenmachine. Ontwerp het meetcontract (`measurement.method`, `baseline`,
   `verifier`) vóór het prijsmodel.
3. Biedmechaniek: kies een sealed-bid-model met vaste sluitingstijd boven continue
   "bidding wars" — continue veilingen tussen algoritmen zijn gevoelig voor
   latency-games en collusie, en enterprises willen reproduceerbaar kunnen aantonen
   waarom een vendor won (Awb-achtige motiveerbaarheid geldt hier commercieel net zo).
4. Marketplace-neutraliteit vastleggen: BNA ranked én incasseert — documenteer publiek
   hoe ranking en fee gescheiden zijn (geen pay-for-ranking), anders wordt de Trust
   Matrix commercieel verdacht. Dit is ook een DMA/P2B-aandachtspunt (platform-to-
   business-verordening: transparantie over rankingcriteria is verplicht).

### E. Geldstromen (het eerlijke verhaal)

**Doel.** BNA als "automated escrow agent" met platform-fee.

**Advies — dit is de grootste juridische stap van het hele plan:**
1. Geld in escrow houden voor derden is in de EU een **betaaldienst** (PSD2). Dat
   betekent: vergunning als betaalinstelling/EMI bij DNB, of — realistisch voor de
   eerste jaren — bouwen op een gelicentieerde partner (Stripe Connect, Adyen for
   Platforms, Mangopay). De partnerroute halveert de time-to-market en verplaatst
   safeguarding-verplichtingen naar de partner; eigen vergunning is pas rendabel bij
   substantieel volume. Neem deze beslissing expliciet en vroeg.
2. Wat er ook gekozen wordt: bouw vanaf dag één een **double-entry ledger** voor
   platformgeld (fee, escrow-saldi, uitbetalingen) gescheiden van de compliance-ledger.
   Geldboekingen en auditbewijs zijn verschillende systemen met verschillende
   consistentie-eisen; vermeng ze niet.
3. De 1–3% fee-mechaniek zelf is triviaal zodra settlement bestaat; de vierde
   veiligheidsklep is dat niet: `MARKET_LIVE_SETTLEMENT` (default uit) — RFQ's en bids
   kunnen volledig functioneren in sandbox-modus zonder dat er één euro beweegt.
   Zelfde patroon als escrow/audit/connectors: protocol eerst, geld pas als de
   randvoorwaarden aantoonbaar staan.

### F. Compliance-gateway: realtime PII/PHI-redactie en Dynamic Policy Mapping

**Doel.** Redactie op de draad; per interactie de juiste ruleset laden.

**Advies.**
1. Architectuur: policy-beslissing en payload-verwerking scheiden.
   - **Policy Decision Point**: een policy-engine (OPA/Rego of AWS Cedar) die per
     interactie het profiel van beide Agent Cards + connectormanifesten evalueert:
     jurisdictie, `dataResidency`, `dataCategories`, tier, Annex III-status. De
     "Rule 44"-gedachte uit de visie is letterlijk policy-as-code; versioneer de
     rulesets en log per transactie **welke policyversie** is toegepast — dat hoort
     als veld in de audit-entry (`policy_id` + `policy_version`), anders is het
     forensisch rapport niet compleet.
   - **Policy Enforcement Point**: de gateway-proxy die redactie, masking en blokkade
     uitvoert. NL-specifiek: standaardherkenners (bijv. Microsoft Presidio) kennen
     geen BSN-elfproef, geen NL-kentekens, geen polis-/DBC-formaten — reken op eigen
     recognizers bovenop een bestaande engine.
2. **Beloof nooit 100% redactie.** ML-gebaseerde PII-detectie haalt geen perfecte
   recall, zeker niet in vrije tekst. De juridisch houdbare claim is: gedocumenteerde
   redactiepipeline + gelogde maskingvelden + configureerbare strengheid (blokkeer bij
   twijfel voor `hoog_risico`-flows) + meetbare precisie/recall per release. De
   bestaande kaartclaim `piiMasking` wordt dan een gevalideerde pipeline-configuratie
   in plaats van een belofte.
3. Latency-budget expliciet maken: redactie + policy-evaluatie in het synchrone pad
   kost tijd. Richtgetal: < 150 ms p95 voor policy + regex/NER-redactie; zware
   LLM-gebaseerde classificatie asynchroon of alleen voor gemarkeerde categorieën.
4. Dit is de natuurlijke evolutie van de bestaande connectorlaag: de proxy die in het
   v2-advies al openstond (allowlist, response-hashing, PII-masking) én deze gateway
   zijn **hetzelfde component**. Bouw hem één keer.

### G. Immutable ledger

**Doel.** Elke prompt/response/contractstatus onwijzigbaar gelogd, forensisch rapport
op knopdruk.

**Advies.**
1. ⚠️ `ARCHITECTURE.md` noemt AWS QLDB als WORM-backend: **QLDB is door AWS
   uitgefaseerd** (eind-of-support aangekondigd; nieuwe accounts kunnen het niet meer
   aanmaken). Vervang die verwijzing. Realistische opties: S3 Object Lock
   (compliance-mode) voor de batches + de bestaande hashketen voor integriteit,
   Azure Confidential Ledger, of immudb. De eigen ketenformule blijft de kern; de
   backend is alleen de onwijzigbare bewaarplaats.
2. Externe verankering: publiceer periodiek (bijv. per uur) de kop van de hashketen
   naar een onafhankelijke plek (transparantielog, RFC 3161-timestamping). Daarmee is
   ook "BNA zelf heeft achteraf niets herschreven" bewijsbaar — de claim uit de visie.
3. "Logt elke prompt en response" botst met twee bestaande principes: zero-data-
   retention en AVG-dataminimalisatie. Advies: log standaard *bewijs over* de payload
   (hashes, maskingvelden, tokentellingen, beslissing) en alleen bij expliciete
   contractuele grondslag de payload zelf (versleuteld, met eigen bewaartermijn).
   Het forensisch rapport ("wie zei wat tegen wie en wanneer") kan vrijwel volledig
   uit metadata + hashes worden opgebouwd.

### H. Liability isolation (pause, rollback, isolatie)

**Doel.** BNA als verzekerbare middleware die non-compliant executie pauzeert en
terugdraait.

**Advies.**
1. Wees precies over wat terugdraaibaar is. Binnen de gateway: ja — een transactie
   pauzeren, een levering niet vrijgeven, een agent bevriezen (dat mechanisme bestaat
   al). Buiten de gateway: nee — een verstuurde e-mail of een uitgevoerde betaling
   rolt niet terug. Het eerlijke model is het **saga-patroon**: elke marktplaats-taak
   definieert vooraf haar compenserende actie, en "rollback" betekent het uitvoeren
   daarvan + WORM-registratie van de compensatie. Herstelbaarheid is niet toevallig al
   een Boek VIII-risicofactor (`recovery`) — koppel de toegestane taaktypes per tier
   aan de vraag of er een compenserende actie bestaat.
2. Verzekerbaarheid is een dataproduct: verzekeraars stappen in op gekwantificeerd
   risico. De audittrail + Trust Matrix + incidenthistorie zijn precies de actuariële
   dataset — maar pas na 12–24 maanden live volume. Plan liability-underwriting dus ná
   de gateway-fase, niet ervoor, en begin met een beperkte dekking (bijv. alleen
   tier A-agents, alleen taken met gedefinieerde compensatie).

---

## 3. Doelarchitectuur (drie vlakken)

```
                        ┌──────────────────────────────────────────────┐
  aanbieders/crawl ───▶ │ CONTROL PLANE                                │
                        │ registry · certificering · seal (JWS+revoc.) │
                        │ Trust Matrix · policy-registry (versioned)   │
                        └───────────────┬──────────────────────────────┘
                                        │ kaarten, policies, attestaties
                                        ▼
  agent A ⇄ agent B ──▶ ┌──────────────────────────────────────────────┐
  (al het verkeer)      │ DATA PLANE — BNA Gateway                     │
                        │ authN/Z (scopes) · policy-enforcement        │
                        │ PII-redactie · response-hashing · metering   │
                        │ → elke transactie naar de WORM-ledger        │
                        └───────────────┬──────────────────────────────┘
                                        │ meterstanden, settlements
                                        ▼
  RFQ/bid/award ──────▶ ┌──────────────────────────────────────────────┐
                        │ MONEY PLANE                                  │
                        │ marketplace-contracten · double-entry ledger │
                        │ PSP-partner (escrow/uitbetaling) · fee 1–3%  │
                        └──────────────────────────────────────────────┘
```

Elke pijl het vlak in = een audit-entry. Control plane beslist, data plane dwingt af,
money plane verrekent — en geen van de drie kan zonder de WORM-trail.

---

## 4. Fasering

**Fase 0 — contracten & demo's (nu, in deze repo, weken).**
Schema's voor `rfq`/`bid`/`settlement` en `discovered-agent`; `policy_id`/`policy_version`
als auditvelden; QLDB-verwijzing vervangen; marketplace-preview-pagina op de site
(zelfde patroon als de connectorcatalogus); vierde klep `MARKET_LIVE_SETTLEMENT`
documenteren; trustScore-aggregatieformule publiek in de docs. Alles CI-geverifieerd
met de bestaande suite.

**Fase 1 — gateway + ledger live (kwartalen).**
De connector-proxy uit het v2-advies uitbouwen tot de volledige gateway (PEP), met
OPA/Cedar als PDP, NL-recognizers voor redactie, kluisintegratie voor connector-
credentials, WORM-backend (S3 Object Lock of gelijkwaardig) + externe verankering.
Trust Matrix begint hier met echte data te vullen. Seal-uitgifte met HSM en revocatie.

**Fase 2 — marketplace in sandbox → betaald (kwartalen, parallel juridisch).**
RFQ/bid/award end-to-end in sandbox (klep dicht); PSP-partnerkeuze en contractering;
Pay-Per-Inference-metering uit de gateway; daarna klep open voor de eerste betaalde
transactievorm. Fee-administratie in de double-entry ledger.

**Fase 3 — geavanceerd (na 12+ maanden live data).**
Performance-based pricing met geformaliseerde meetcontracten en arbitrage;
liability-dekking op basis van de opgebouwde actuariële dataset; federatie/crawling
op schaal met claim-flow.

---

## 5. Belangrijkste risico's en open besluiten

1. **PSD2-route** (partner vs. eigen vergunning) — bepaalt de hele Fase 2-planning.
   Advies: partner. Besluit nodig vóór marketplace-bouw start.
2. **Redactie-belofte** — "automatically scans, redacts, anonymizes" mag commercieel
   nooit "gegarandeerd schoon" worden. Formuleer de claim als gecontroleerde,
   gelogde, meetbare pipeline. Juridische review op alle marketing hierover.
3. **QLDB-afhankelijkheid in de huidige architectuurtekst** — vervangen (zie G.1).
4. **Ranking + fee in één hand** — publiceer rankingmethodiek (P2B/DMA) en houd
   commercie aantoonbaar buiten de Trust Matrix.
5. **Oracle-probleem bij performance-bonussen** — niet bouwen zonder meetcontract-
   en arbitrageontwerp.
6. **AI Act-timing** — Annex III-verplichtingen (aug 2027 hoogrisico) vallen midden in
   Fase 1/2; de certificeringspipeline is de mitigatie, maar de gateway moet
   AI Act-transparantievelden (deployer/provider-rollen) vanaf het begin meenemen.

## 6. Eerstvolgende concrete stappen

1. Besluit PSD2-route (partner-shortlist: Stripe Connect / Adyen / Mangopay).
2. Fase 0 uitvoeren in deze repo (schema's, auditvelden, QLDB-fix, marketplace-preview,
   docsformule Trust Matrix) — klein, CI-gedekt, en het maakt de visie demo-baar.
3. Architectuurbeslisdocument gateway: OPA vs. Cedar, redactie-engine + NL-recognizers,
   WORM-backend-keuze, latency-budget. Eén A4 per keuze, in `DECISIONS.md`-stijl.
4. Juridische toets op de drie claims: escrow/geldstromen, redactiegarantie,
   liability/rollback-taal.
