# Reconciliation memo — one canonical risk-scoring schema

**Onderwerp:** de twee parallelle risicoscoringsmodellen samenvoegen tot één bindende
Agent Card-schema, zodat het Handboek (instructie-/veiligheidslaag) en de runtime-kaart
dezelfde velden en dezelfde semantiek delen.
**Status:** voorstel ter besluitvorming.
**Aanleiding:** `ci/handbook-coverage.test.js` faalt — van de 41 `machineFields`-verwijzingen
in het Handboek resolven er 4 direct, 13 alleen via alias (naamdrift) en 24 helemaal niet.
Vier runtime-handhavingsvelden zijn door geen enkel artikel gedekt (waarvan één uit v2.1:
de connector-pinregel, zie §2.4).

---

## 1. Het probleem in één zin

Er bestaan twee onafhankelijke risicomodellen met verschillende assen, verschillende
rekenwijzen, verschillende drempels en verschillende veldnamen — en het normatieve
model (Handboek) verwijst naar velden die de geïmplementeerde kaart niet heeft.

| | Model A — Handboek Boek VIII (normatief) | Model B — `agents-data.js` (geïmplementeerd) |
| --- | --- | --- |
| Rekenwijze | Additief: som van 5 componenten met puntplafonds | Gewogen gemiddelde: subscores 0–100 × gewichten |
| RF-componenten | sector, EU AI Act-klasse, capability-categorie, datagevoeligheid, autonomie | data, impact, autonomie, links, herstelbaarheid |
| Plafonds/gewichten | 25 / 30 / 20 / 15 / 10 (= 100) | 0.30 / 0.25 / 0.20 / 0.15 / 0.10 (= 1.0) |
| Risicoklassen | 3 klassen: 0–33 / 34–66 / 67–100 | 4 klassen: ≤30 / ≤55 / ≤75 / ≤100 |
| Vertrouwensscore | start 50, 6 componenten met bandbreedtes | opgeslagen `trustScore` + `trustMetrics` |
| Inhuurtier | afgeleid uit matrix (Art. 8.11) | opgeslagen `hireTier`, geen zichtbare formule |
| Namespace | `bna.riskScoring.*` (dotted) | plat camelCase |
| Extra as | — | `riskLevel` 1–5 (aparte barometer) |
| Identiteit | `provider.organization`, `provider.kvkNumber` (object) | `provider` (string) |

De twee modellen zijn niet elkaars herbenoeming: ze meten deels **andere dingen**. Model A
weegt sector en AI Act-klasse zwaar (samen 55 van 100 punten); Model B kent die assen
helemaal niet. Omgekeerd kent Model B `links`, `impact` en `herstelbaarheid`, die Model A
mist — en `links` is niet vrijblijvend: sinds v2/v2.1 hangt de connector-invariant
(`riskBreakdown.links >= max(connector.riskContribution)`) eraan.

Gevolg: een healthcare-agent met AI Act-klasse *high* en een general-agent met klasse
*limited* kunnen in Model B een identieke `riskFactor` krijgen als hun vijf abstracte
dimensies toevallig samenvallen. Dat is een normatieve zwakte, geen cosmetisch verschil.

---

## 2. Veld-voor-veld mapping

Legenda: **RESOLVED** = zelfde veld bestaat; **ALIASED** = zelfde betekenis, andere
naam/vorm (drift); **GAP** = norm verwijst naar niet-bestaand veld.

### 2.1 Risicoscoring-blok

| Handboek-veld (Art.) | Kaart nu | Status | Kanoniek voorstel |
| --- | --- | --- | --- |
| `bna.riskScoring.riskFactorScore` (2.7, 8.4) | `riskFactor` | ALIASED | `riskScoring.riskFactorScore` |
| `bna.riskScoring.riskFactorClass` (2.7, 4.4, 8.6) | — (alleen `bnRiskClass()`-functie) | GAP | `riskScoring.riskFactorClass` (opgeslagen, afgeleid) |
| `bna.riskScoring.riskFactorComponents` (8.4) | `riskBreakdown` | ALIASED | `riskScoring.riskFactorComponents` (nieuwe assenset, §3) |
| `bna.riskScoring.trustScore` (2.8, 8.8) | `trustScore` | ALIASED | `riskScoring.trustScore` |
| `bna.riskScoring.trustScoreLastCalculated` (2.8, 8.10) | — | GAP | `riskScoring.trustScoreLastCalculated` |
| `bna.riskScoring.inhuurTier` (4.5, 8.11) | `hireTier` | ALIASED | `riskScoring.inhuurTier` (afgeleid uit matrix) |
| `bna.riskScoring.requiredConsentLevel` (4.5, 5.9, 8.12) | — | GAP | `riskScoring.requiredConsentLevel` (afgeleid uit tier) |
| `bna.riskScoring.applicableArticles` (1.3, 8.30) | — | GAP | `riskScoring.applicableArticles` (pipeline-gevuld, immutable) |
| `bna.riskScoring.suspended` (8.27) | `integrity.status` / `certification.status` (indirect) | GAP | `riskScoring.suspended` (boolean) |
| `bna.riskScoring.suspensionReason` (8.27) | — | GAP | `riskScoring.suspensionReason` |
| `bna.humanOversightMeasures` (5.1) | `functional.hitlTrigger` (los, per agent) | GAP | `humanOversightMeasures[]` (gestructureerd, verwijst naar artikelnr) |

### 2.2 Identiteit, certificering, integriteit

| Handboek-veld (Art.) | Kaart nu | Status | Kanoniek voorstel |
| --- | --- | --- | --- |
| `provider.organization` (2.1) | `provider` (string) | GAP | `provider.organization` (object) |
| `provider.kvkNumber` (2.1) | — | GAP | `provider.kvkNumber` |
| `bna.cardHash` (2.1, 6.3) | `integrity.cardHash` | ALIASED | `integrity.cardHash` |
| `signatures` (6.4) | `integrity.signedAt` (alleen tijd) | GAP | `integrity.signatures[]` (Ed25519/JWS, A2A v1.0) |
| `bna.wellKnownUrl` (2.4, 6.5) | — | GAP | `wellKnownUrl` |
| `bna.certification.euAiAct.riskClass` (2.5) | `complianceCheck.euAiActClass` | ALIASED | `certification.euAiAct.riskClass` |
| `bna.certification.expiresAt` (6.7) | `certification.validUntil` | ALIASED | `certification.expiresAt` |
| `bna.certification.avgChecklist` (4.6) | `avg` (vrije tekst) | ALIASED | `certification.avgChecklist` (7-punts, machine-leesbaar) |
| `bna.certification.certifiedBy` (4.7) | — | GAP | `certification.certifiedBy` |
| `bna.certification.notifiedBodyName` (4.7) | — | GAP | `certification.notifiedBodyName` |
| `bna.capabilities[].category` (2.5) | `capabilities[]` (platte strings) | GAP | `capabilities[]` als objecten met `category`, `dataSensitivity`, `autonomyLevel`, `dataCategories` |
| `bna.capabilities[].dataSensitivity` (2.5) | — | GAP | idem |
| `bna.capabilities[].autonomyLevel` (2.5) | — | GAP | idem |
| `bna.capabilities[].dataCategories` (3.5) | — | GAP | idem |

### 2.3 Omgekeerde dekking — runtime handhaaft op ongedekte velden

De runtime blokkeert/vrijgeeft aanroepen op basis van velden die het Handboek **onder
andere namen of helemaal niet** benoemt:

| Runtime-veld (kaart) | Gedekt door artikel? | Actie |
| --- | --- | --- |
| `hireTier` | ✓ via `inhuurTier` (4.5, 8.11) | hernoemen naar `inhuurTier` |
| `integrity.status` (`geldig`/`gebroken`) | ✗ | koppelen aan `suspended` (8.27) + `cardHash` (6.3) |
| `certification.status` (`geschorst`/…) | ✗ | koppelen aan toelaatbaarheid (8.13) + `suspended` (8.27) |
| `annexIII` | ✗ (in geen enkele `machineFields`) | opnemen als component-input van `riskFactorComponents.aiActClass` (8.4) |
| `integrity.connectorPins` (v2.1) | ✗ (Handboek kent geen enkel connector-artikel) | connector-artikelen toevoegen aan Boek VIII (§2.4) |

### 2.4 v2.1 — de connectorlaag is normatief ongedekt

Sinds v2/v2.1 handhaaft de runtime een complete koppelingslaag die het Handboek alleen
als begripsdefinitie kent: de `riskContribution`-invariant, manifest-ondertekening
(`integrity.manifestHash`), de pin-breukregel (`integrity.connectorPins`, gehandhaafd in
`POST /v1/connectors/{id}/invoke` stap 3) en vier veiligheidskleppen. Naar de maatstaf
van deze memo is dat de grootste ongedekte handhaving: er is geen artikel dat
connectorcertificering, de pinregel of de weigering-bij-breuk normeert. Het kanonieke
schema (§5) neemt `connectorIds` en `integrity.connectorPins` daarom expliciet op, en de
migratieroute (§6) krijgt een stap voor connector-artikelen in Boek VIII.

---

## 3. Kanoniek risicomodel

**Uitgangspunt:** behoud de rekenstructuur van Model B (gewogen gemiddelde van subscores
0–100), want die houdt beide bestaande invarianten ongewijzigd overeind. Vervang de
abstracte assen door de **classificatie-gegronde componenten van Model A**, zodat sector
en AI Act-klasse weer eerste-klas meewegen en de score juridisch uitlegbaar is.

### 3.1 Componenten en gewichten (som = 1.00)

| Component | Gewicht | Subscore-rubriek (0–100), ontleend aan Boek VIII Art. 8.4 |
| --- | --- | --- |
| `sector` | 0.15 | financial_services/healthcare 100; insurance/hr/legal/compliance 72; real_estate/logistics/public_sector 40; general 0 |
| `aiActClass` | 0.20 | high 100; limited 50; minimal 0 (unacceptable ⇒ geen score, Art. 8.16) |
| `data` | 0.20 | biometrisch/bijzonder 100; overige persoonsgegevens 55; geen 0 |
| `impact` | 0.15 | onomkeerbaar+nadelig 100; omkeerbaar met gevolg 55; adviserend 0 |
| `autonomy` | 0.10 | handelt zonder bevestiging, onomkeerbaar 100; zonder bevestiging maar omkeerbaar 50; mens beslist 0 |
| `links` | 0.15 | beoordeelde koppelingsafhankelijkheid (0–100) met als harde **ondergrens** `max(connector.riskContribution)` van de gekoppelde connectors — een agent mag zwaarder scoren dan zijn zwaarste koppeling (veiligheidsmarge, zoals de huidige data ook doet: KYC links 60 > connector-max 55), nooit lichter |
| `recovery` | 0.05 | niet terugdraaibaar 100; terugdraaibaar met inspanning 50; triviaal terug te draaien 0 |

`riskFactorScore = round(Σ gewicht·subscore)`, geheel getal 0–100.

Deze set is een **superset**: sector + aiActClass + data + autonomy komen uit Model A;
impact + links + recovery blijven behouden uit Model B. `capabilityCategory` uit Model A
gaat op in `impact` + `aiActClass` (de capability-categorie bepaalt beide), zodat er geen
dubbeltelling ontstaat.

**Herwegingskeuze (expliciet ter besluitvorming):** in Model A wegen sector + AI Act-klasse
samen 55/100; hier 35/100, omdat de operationele assen uit Model B (impact, links,
herstelbaarheid — samen 0.35) binnen hetzelfde gewichtsbudget moeten passen. Wie de
normatieve zwaarte van Model A wil behouden, verschuift gewicht van impact/recovery naar
sector/aiActClass; de invarianten van §3.2 veranderen daar niet door.

### 3.2 Invarianten (blijven, nu programmatisch afdwingbaar)

1. `riskFactorScore === round(Σ gewicht·subscore)` — behoud van Model B's invariant 1.
2. `riskFactorComponents.links >= max(connector.riskContribution)` — behoud van invariant 2
   (v2.0). Omdat `links` op de 0–100-schaal blijft, verandert deze regel niet.
3. **Nieuw:** `sum(gewichten) === 1.00` en elke subscore ∈ [0,100].

### 3.3 Drempels — kies de 3 juridische klassen

Adopteer de drempels van Model A (**0–33 Laag / 34–66 Midden / 67–100 Hoog**) en laat de
4-bandenindeling van Model B (`verhoogd`) vervallen. Reden: de hele certificeringszwaarte
(Boek IV Art. 4.1 toetsing, Art. 4.3 testdekking 70/85/95 %, Art. 4.7 aangemelde instantie)
en de Tiermatrix hangen aan **drie** klassen. De vierde band heeft geen normatief gevolg;
wie de visuele nuance wil behouden, houdt `verhoogd` als pure weergavesplitsing binnen
*Hoog* zonder eigen rechtsgevolg.

`riskLevel` 1–5 wordt géén onafhankelijke invoer meer maar een deterministische afbeelding
van `riskFactorScore` (bijv. vijf gelijke banden), zodat de barometer nooit los kan lopen
van de score.

### 3.4 Vertrouwensscore en tier — ongewijzigd overnemen uit Boek VIII

De Vertrouwensscore (Art. 8.8: start 50, componentbandbreedtes, incident-plafond) en de
Tiermatrix (Art. 8.11) zijn in Model A al volledig en afdwingbaar uitgewerkt. Neem ze
letterlijk over als de kanonieke definitie; `inhuurTier` en `requiredConsentLevel` worden
**afgeleide, immutable** velden (pipeline-gevuld, niet door vendor/afnemer wijzigbaar,
Art. 8.30).

Let op: ook de **vertrouwensbanden** zijn gedrift. `BN_RISK_MODEL.trustClasses` hanteert
vier banden (≥80 hoog / ≥60 gemiddeld / ≥40 beperkt / ≥0 onvoldoende) waar Art. 8.11 er
drie kent (>70 hoog / 40–70 midden / <40 laag). Zelfde behandeling als de risicoklassen
(§3.3): de drie banden van Art. 8.11 zijn kanoniek, want de Tiermatrix hangt eraan;
migratiestap 5 lijnt beide klassensets uit.

---

## 4. Namespace-besluit

Behandel `bna.` in het Handboek als **documentatie-prefix** die "de root van de Agent Card"
betekent, niet als letterlijk JSON-pad. De kanonieke JSON gebruikt platte camelCase met één
genest `riskScoring`-object. Daarmee geldt: Handboek `bna.riskScoring.inhuurTier`
≡ kaart `riskScoring.inhuurTier`. Dit ruimt in één klap de 13 aliassen op, want alleen de
`bna.`-prefix en de losse benamingen (`hireTier`, `riskFactor`, `validUntil`) veroorzaakten
de drift. `handbook-coverage.test.js` blijft de brug bewaken; `ci/field-map.json` mag
krimpen naar nul aliassen zodra de hernoeming is doorgevoerd.

---

## 5. Kanoniek schema (voorstel)

```jsonc
{
  "agentId": "bna:agent:kyc-screen-004",
  "provider": {
    "organization": "ComplianceWorks B.V.",
    "kvkNumber": "12345678"
  },
  "wellKnownUrl": "https://…/.well-known/agent.json",
  "capabilities": [
    {
      "id": "kyc.screen",
      "category": "identity_verification",
      "dataSensitivity": "special",       // special | personal | none
      "autonomyLevel": "unconfirmed_irreversible",
      "dataCategories": ["identiteit", "bsn"]
    }
  ],
  "certification": {
    "euAiAct": { "riskClass": "high" },     // high | limited | minimal
    "books": ["II", "IV", "VI"],
    "status": "gecertificeerd",
    "certifiedBy": "BN Agent",
    "notifiedBodyName": null,
    "expiresAt": "2027-03-01",
    "avgChecklist": {
      "grondslag": true, "doelbinding": true, "dataminimalisatie": true,
      "bewaartermijn": true, "beveiliging": true, "rechtenBetrokkenen": true,
      "verwerkersovereenkomst": true
    }
  },
  "connectorIds": ["bnc:connector:kvk-handelsregister", "bnc:connector:ubo-register",
                   "bnc:connector:eu-sanctielijsten", "bnc:connector:vies-btw-validatie"],
  "riskScoring": {
    // 0.15·100 + 0.20·100 + 0.20·55 + 0.15·55 + 0.10·50 + 0.15·60 + 0.05·50 = 70.75 → 71
    "riskFactorScore": 71,
    "riskFactorClass": "hoog",              // laag | midden | hoog  (0-33/34-66/67-100)
    "riskFactorComponents": {
      "sector": 100,        // financial_services
      "aiActClass": 100,    // high (Annex III)
      "data": 55,           // persoonsgegevens, geen biometrie in de agentomgeving
      "impact": 55,         // afwijzing zakelijke relatie: omkeerbaar met gevolg
      "autonomy": 50,       // autonome goedkeuringen, HITL-gate bij elke hit
      "links": 60,          // ondergrens: max(riskContribution) = 55 (ubo-register)
      "recovery": 50        // terugdraaibaar met inspanning
    },
    "trustScore": 88,
    "trustScoreLastCalculated": "2026-07-01T00:00:00Z",
    "inhuurTier": "B",                      // RF hoog × VS hoog (>70) → B (Art. 8.11)
    "requiredConsentLevel": "first_hire",   // afgeleid uit tier (Art. 8.12)
    "applicableArticles": ["5.2", "5.4", "8.15"],  // pipeline-gevuld, immutable
    "suspended": false,
    "suspensionReason": null
  },
  "humanOversightMeasures": [
    { "article": "5.7", "measure": "Menselijke goedkeuring per transactie bij afwijzing" }
  ],
  "integrity": {
    "codeHash": "f9e1…",
    "cardHash": "c0bf…",
    "connectorPins": [                       // v2.1: snapshot bij ondertekening, onder cardHash
      { "connectorId": "bnc:connector:kvk-handelsregister", "version": "1.4.0", "manifestHash": "39fa…" }
    ],
    "signatures": [
      { "alg": "EdDSA", "kid": "bna-2026", "jws": "eyJ…" }
    ],
    "signedAt": "2026-05-12T09:14:00Z",
    "status": "geldig"                       // geldig ⇔ !suspended && cardHash klopt
  }
}
```

**Let op — de score verschuift.** Onder het kanonieke model gaat deze agent van
`riskFactor` 62 (Model B, klasse *midden*) naar `riskFactorScore` 71 (klasse *hoog*),
vooral doordat sector en AI Act-klasse nu eerste-klas meewegen. De Inhuurtier blijft
via de matrix (Art. 8.11) gelijk op **B** (RF hoog × Vertrouwensscore hoog), maar de
certificeringszwaarte (Boek IV) verandert wél mee. Precies daarom verdient migratiestap 2
een aparte review per agent.

---

## 6. Migratieroute

1. **Hernoemen (drift → 0):** `riskFactor → riskScoring.riskFactorScore`,
   `hireTier → riskScoring.inhuurTier`, `trustScore → riskScoring.trustScore`,
   `certification.validUntil → certification.expiresAt`, `provider` (string) → object.
   Dit ruimt de 13 aliassen op; `field-map.json` verliest die entries.
2. **Componenten herzien:** `riskBreakdown` → `riskScoring.riskFactorComponents` met de
   7-assenset van §3.1; herbereken elke demo-agent en controleer invariant 1 en 2 met de
   bestaande scriptcontroles.
3. **Ontbrekende velden toevoegen (GAP → RESOLVED):** de 24 falende verwijzingen — het
   volledige `riskScoring`-blok, `requiredConsentLevel`, `applicableArticles`,
   `suspended`/`suspensionReason`, `humanOversightMeasures`, `wellKnownUrl`,
   `certification.certifiedBy`/`notifiedBodyName`, `signatures`, en de capability-objecten.
4. **Schema bijwerken:** `agent-manifest.schema.json` krijgt het `riskScoring`-blok als
   `required` (Art. 8.30 schrijft het dwingend voor) en de capability-objectvorm.
5. **Drempels uitlijnen:** vervang de 4-bandenindeling in `BN_RISK_MODEL.riskClasses` door
   de 3 juridische klassen; `riskLevel` wordt een afbeelding van `riskFactorScore`.
6. **Connector-artikelen toevoegen (v2.1):** Boek VIII (of een eigen titel) normeert
   connectorcertificering, `riskContribution`, manifest-ondertekening en de
   pin-breukregel, met `machineFields` voor `connectorIds` en `integrity.connectorPins`;
   daarmee wordt het vierde ongedekte handhavingsveld (§2.4) gedekt.
7. **CI groen maken:** `ci/handbook-coverage.test.js` moet na stap 1–6 PASS geven met
   0 UNRESOLVED, 0 aliassen en 0 ongedekte handhavingsvelden. Voeg de test toe aan de
   pijplijn naast de bestaande invariant-controles.

## 7. Aanbeveling

Voer stap 1 (hernoemen) en stap 3 (ontbrekende velden) als eerste uit: samen sluiten ze
37 van de 41 openstaande verwijzingen en maken ze de instructie-/veiligheidslaag voor het
eerst daadwerkelijk afdwingbaar. Stap 2 (componentherziening) raakt demodata en verdient
een aparte review omdat het scores verschuift — leg elke wijziging vast in `DECISIONS.md`,
consistent met de bestaande werkafspraak.
