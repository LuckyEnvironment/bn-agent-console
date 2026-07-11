# Exploratie — Dynamic Escrow Budget (DEB) & hardware-attestatie

**Onderwerp:** autonoom risicomanagement via een realtime, dynamisch financieel en
datatechnisch mandaat per agent, plus cryptografische remote attestation van de
draaiende code (Secure Enclaves / TEE's).
**Status:** exploratie ter besluitvorming — geen implementatie.
**Bron:** `Dynamic Escrow.rtf` (11 juli 2026); getoetst aan `bn-agent/server/escrow.ts`
(de bestaande domeinlaag), Handboek Boek VIII en de v2.1-integriteitslaag.

---

## 1. Het concept in één alinea

In plaats van een agent te stoppen krijgt hij een continu berekend mandaat langs drie
dimensies: **Financial Escrow** (maximaal autonoom te besteden bedrag per transactie en
per uur, gereserveerd op een clearing-account), **Data Velocity Escrow** (maximale
hoeveelheid gevoelige data per seconde richting andere agents) en een **Trust Score
Multiplier α** (0.0–1.0) die het budget meebeweegt met historisch gedrag. Handhaving
loopt via een token bucket in lokale state stores (RocksDB + Redpanda) met een
eBPF-laag op de nodes; overschrijding leidt niet tot een fout maar tot een
**asynchrone HITL-gate**. Daarnaast: agents draaien in Secure Enclaves (AWS Nitro,
TEE) en het platform verifieert via remote attestation dat de gecertificeerde
`code_hash` daadwerkelijk op beveiligde hardware draait.

## 2. Waarom dit past — de sterke kant

1. **DEB is geen nieuw concept maar de handhavingsmotor van bestaande artikelen.**
   Art. 8.15 lid 2 (Tier C: goedkeuring boven een drempel) en Art. 8.12 bestaan al;
   het Handboek autoriseert per-transactie-drempels expliciet. DEB maakt de drempel
   dynamisch en per agent berekend in plaats van statisch per contract.
2. **Het dicht een concreet gat in de huidige code.** In `server/escrow.ts` is
   `aboveThreshold` vandaag een **door de aanroeper zelf aangeleverde boolean** — de
   partij die gecontroleerd moet worden, verklaart zelf of hij boven de drempel zit.
   Een server-side budgetcheck vervangt een erewoord door een meting. Dit is het
   sterkste argument voor DEB, en het staat niet eens in de RTF.
3. **"Mandaat i.p.v. stoppen" is consistent met de tier-filosofie.** Tier A (autonoom)
   en Tier D (per transactie HITL) zijn de polen; DEB maakt daar een continu spectrum
   van. De asynchrone HITL-gate bij overschrijding hergebruikt het bestaande
   approvals-mechanisme (`approval_scope: "drempel"` bestaat al in de domeinlaag).
4. **Attestatie completeert de integriteitsketen.** De keten is nu: `code_hash` (wat
   gecertificeerd is) → `card_hash` (wat beloofd is) → `connectorPins` (waarmee het
   praat). Remote attestation voegt de ontbrekende schakel toe: **wat er nú
   daadwerkelijk draait, en waarop**. Het grootste effect zit bij **Optie B (BYOC)**:
   daar is de garantie vandaag het zwakst ("code draait in de omgeving van de
   afnemer"), en attestatie geeft cryptografisch bewijs zonder de infrastructuur te
   bezitten. Voor Optie A is het een verdieping; voor Optie B is het een doorbraak.

## 3. Kritische toetsing — wat niet klopt of eerst moet worden opgelost

### 3.1 "Binnen één milliseconde overal ter wereld" is natuurkundig onmogelijk

Licht doet ~130 ms over een rondje aarde; Amsterdam→Sydney enkele reis is al ~50 ms.
Geen enkel push-mechanisme revoceert wereldwijd in 1 ms. De claim moet herschreven
worden naar wat wél kan — en dat is sterk genoeg:

- **lokale handhaving in microseconden**: de token-bucket-check op de node zelf
  (de ~2 µs-claim voor een lokale RocksDB/memory-check is plausibel);
- **wereldwijde propagatie sub-seconde**: Redpanda-fan-out naar edge-nodes in
  realistisch 100–300 ms;
- **fail-closed als echte garantie**: leases en aanroepen vereisen een *verse*
  attestatie/budgettoken met korte TTL. Revocatie is dan geen race tegen de
  lichtsnelheid maar het **uitblijven van een verse toekenning** — een agent zonder
  geldig token krijgt nergens iets, ongeacht propagatievertraging. Dit is de
  formulering die een auditor accepteert en marketing alsnog kan dragen.

### 3.2 De Trust Score Multiplier introduceert een dérde scoringsmodel

De reconciliatiememo heeft deze week net twee parallelle risicomodellen samengevoegd;
de α-curve uit de RTF ("exponentieel omhoog bij foutloos gedrag, direct naar nul bij
een fout") is een nieuw, derde reputatiemodel dat frontaal botst met Art. 8.8:
de Vertrouwensscore kent bandbreedtes, een incident-plafond van −25, géén instant-zero
en kwartaalherberekening. Voorstel:

- **α wordt een afleiding van de bestaande Vertrouwensscore**, geen eigen curve:
  bijv. `α = clamp(trustScore/100)` met tier-afhankelijke basisbudgetten
  (`budget = basis(tier) × α`), Tier D ⇒ budget 0 (consistent met Art. 8.12).
- **"Direct naar nul" bestaat al — het heet schorsing** (Art. 8.27, Titel 9).
  Budget → 0 bij schorsing is correct en al genormeerd; een aparte instant-zero-curve
  ernaast is ongoverned drift van precies het soort dat de coverage-test flagt.

### 3.3 Financial Escrow met clearing-account is vergunningsplichtig

Geld van derden aanhouden en betalingen uitvoeren raakt PSD2/EMD2: in Nederland
betekent dat een DNB-vergunning als betaalinstelling of EGI — of samenwerking met een
vergunninghoudende PSP (de catalogus heeft nota bene al Mollie- en
PSD2-PIS-connectors). Dit is een **juridische blocker vóór de bouw van de financiële
dimensie**, zelfde categorie als de bestaande kleppenregel: het platform raakt geen
cliëntgeld aan voordat de randvoorwaarden staan. De **Data Velocity-dimensie heeft
deze blocker niet** en kan als eerste.

### 3.4 eBPF-handhaving werkt alleen op eigen nodes

Kernel-level handhaving (`approved_agents_map`) vereist controle over de kernel — dat
is Optie A (hosted). Bij Optie B (BYOC) heeft het platform geen kernel bij de afnemer;
daar is de handhavingsgrens: attestatie-eis + platformgemedieerde escrow-flows. Dit
moet eerlijk in de architectuurdocumentatie, anders belooft de marketing handhaving
die bij BYOC niet bestaat.

### 3.5 De stack is overgedimensioneerd voor de huidige fase

Redpanda + RocksDB + eBPF is een edge-architectuur voor een netwerk met duizenden
nodes en microseconde-eisen. Het platform draait vandaag op Next.js + Supabase, de
roadmap zit in fase 1–2 (site live, eerste pilotagent). De **DEB-semantiek** (drie
dimensies, token bucket, refill-formule, HITL bij overschrijding) is onafhankelijk van
de stack en kan in de bestaande domeinlaag (Postgres/Supabase; zonodig Redis voor de
bucket). De edge-stack is een schaalbeslissing voor later, geen startpunt.

### 3.6 Nieuwe handhavingsvelden vereisen Handboek-artikelen

Budget, α en attestatie-status worden blokkerende runtime-velden. Naar de maatstaf
van `ci/handbook-coverage.test.js` (REVERSE-check) zijn dat handhavingsvelden die een
artikel nodig hebben — anders handhaaft het platform een controle die geen norm
autoriseert. DEB moet dus landen mét een nieuwe titel in Boek VIII (werktitel
"Dynamisch mandaat") en `machineFields` voor de nieuwe velden.

## 4. Integratieschets

### 4.1 Agent Card (nieuw blok, afgeleid en immutable zoals `inhuurTier`)

```jsonc
"mandate": {
  "financialPerTx": 500,          // EUR; basis(tier) × α
  "financialPerHour": 2500,
  "dataVelocityBps": 1048576,     // gevoelige data, bytes/s
  "alpha": 0.88,                  // = trustScore/100, geclamped
  "refillRate": "…",              // token bucket refill per dimensie
  "computedAt": "2026-07-11T…Z"   // herberekend per Art. 8.10-triggers
},
"integrity": {
  // bestaand: codeHash, cardHash, connectorPins, signedAt, status
  "attestation": {
    "platform": "nitro",              // nitro | sev-snp | tdx
    "measurement": "…",               // PCR-set / enclave measurement
    "verifiedAt": "2026-07-11T…Z",
    "expiresAt": "2026-07-11T…Z",     // korte TTL ⇒ fail-closed
    "status": "geldig"                // geldig | verlopen | mismatch
  }
}
```

Attestatie-mismatch ⇒ `suspended` (Art. 8.27-flow), WORM-event, publieke check toont
het — identiek aan de bestaande hash-breukregel, uitgebreid naar runtime.

### 4.2 API & domeinlaag

- `GET /v1/escrow/budget/{agentId}` — realtime saldo per dimensie (auditor + afnemer).
- `submitEscrowRequest`: vervang caller-declared `aboveThreshold` door een
  server-side budgetcheck; nieuwe status `blocked_budget_exceeded` naast
  `blocked_awaiting_consent`; hergebruik `bna_approvals` voor de asynchrone HITL-gate.
- Invoke-route (v2.1) krijgt stap 0: attestatie geldig — vóór kaart-geldig.
- **Twee nieuwe veiligheidskleppen**, zelfde patroon als de bestaande vier:
  `DEB_LIVE_BUDGET` (uit ⇒ *shadow mode*: budgetten worden berekend, gelogd en
  gerapporteerd maar blokkeren niets — kalibratie zonder risico) en
  `ATTESTATION_REQUIRED` (aan ⇒ fail-closed).

### 4.3 WORM-audittrail

Nieuwe optionele events (ketenformule ongewijzigd, zelfde aanpak als
`connector_manifest_hash`): `budget.check` (saldo vóór/na), `budget.exceeded` (+
HITL-uitkomst), `attestation.verified` / `attestation.mismatch`.

### 4.4 Handboek

Nieuwe titel in Boek VIII: het mandaat als afgeleide van Tier × Vertrouwensscore,
overschrijding = toetsingsmoment onder Art. 8.15, attestatie-eis per hostingmodel
(verplicht bij Optie A; bij Optie B certificeringseis vanaf een te kiezen tier).
`enforcementFields` in `ci/field-map.json` aanvullen met `mandate.*` en
`integrity.attestation.status`.

## 5. Gefaseerde route

| Fase | Wat | Randvoorwaarde |
| --- | --- | --- |
| 1 | DEB-semantiek in de bestaande domeinlaag, **shadow mode**, alleen Data Velocity + server-side drempel (vervangt `aboveThreshold`); Handboek-titel + coverage-test bij | geen — kan nu |
| 2 | Attestatie-PoC op AWS Nitro voor Optie A; `integrity.attestation` + invoke-gate; daarna BYOC-attestatie als certificeringseis | Nitro-omgeving; TTL-keuze |
| 3 | Financieel mandaat live (klep open) | vergunningsroute: PSP-partner óf eigen PSD2/EGI-vergunning |
| 4 | Edge-architectuur (Redpanda/RocksDB/eBPF) | aantoonbare latency-/schaalbehoefte |

## 6. Open vragen voor besluitvorming

1. Vergunningsroute financiële dimensie: PSP-partnerschap of eigen vergunning?
2. α-formule: lineair `trustScore/100` of de tragere curve — en vastleggen in Boek VIII.
3. Attestatie-TTL (voorstel: minuten, niet uren) en her-attestatiefrequentie.
4. BYOC: attestatie verplicht voor alle tiers of alleen C/D en Annex III?
5. Waar leeft de budget-engine: in de escrow-service (logisch, al gescheiden) of apart?
6. Herformulering marketingclaim: "fail-closed binnen de token-TTL" i.p.v. "1 ms
   wereldwijd" — akkoord?
