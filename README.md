# BN Agent — console & platform-preview

BN Agent ("Be An Agent") is de infrastructuurlaag die AI-agents vindbaar, verifieerbaar en
veilig onderling laat communiceren: een Discovery Registry, certificering met ondertekende
Agent Cards, een escrow-laag voor agent-to-agent data en een onwijzigbare (WORM) audittrail.

Deze repository bevat de publieke site (statisch, geen buildstap), de gedeelde
voorbeelddata, de JSON-schema's en de API-routedefinities voor het platform.

## Lokaal draaien

```sh
python3 -m http.server 8080        # macOS/Linux
# of: .\serve.ps1                  # Windows
```

Open daarna `http://localhost:8080/`. Een webserver is nodig (geen `file://`) omdat de
audittrail-ketenverificatie `crypto.subtle` gebruikt, dat een secure context vereist
(localhost of https).

## Pagina's

| Pagina | Doel |
| --- | --- |
| `index.html` | Landingspagina (marketing) |
| `bn-agent-registry-preview.html` | Discovery Registry — doorzoekbare agentlijst (19 voorbeeldagents, 10 sectoren) |
| `bn-agent-agent-detail.html?id=…` | Volledige Agent Card v2.0: risico-barometer, vier datablokken, connectors, integriteit/hashes, Boek VIII-scores |
| `bn-agent-connectors.html` | Connectorcatalogus — gecertificeerde systeemkoppelingen (iDIN, KVK, DigiD, eHerkenning, Microsoft Graph, …) |
| `bn-agent-certificering.html` | Certificering: drie boeken, validatiepipeline (3 stappen), hash-breukregel, hosting Optie A/B |
| `bn-agent-audit-trail.html` | Auditor-dashboard: WORM-logboek met vier waarborgen per transactie en live ketenverificatie |
| `bn-agent-check.html?id=…&tx=…` | Publieke certificaatcheck — doel van het "Powered by BN Agent"-watermerk |
| `bn-agent-docs.html` | Technische documentatie: standaard, API's, logvelden, schema's |
| `bn-agent-console.html` | Console-demo (SPA) voor afnemers |
| `bn-agent-landingpage.html` | Alternatieve marketingvariant van de landingspagina |

## Structuur

```
assets/           design-tokens (bn-tokens.css), gedeelde datasets (agents-data.js,
                  connectors-data.js, audit-data.js), lead-form
schemas/          JSON Schema 2020-12: agent-manifest + connector + audit-log-entry
                  (+ voorbeelden)
v1/               Next.js App Router API-routes (registry, connectors, escrow, oauth,
                  audit, check); bedoeld om gemount te worden in de platform-app
                  (zie ARCHITECTURE.md)
handboek/         handboekdata + types (TypeScript)
developers/       developersportaal-pagina (React)
```

`assets/agents-data.js` is de single source of truth voor alle voorbeeldagents; de
Agent Card-uitbreiding (datablokken, integriteit, risiconiveau) wordt daar in de
basisdataset gemerged zodat elke pagina één volledig kaartobject ziet. v2.0 voegt
`connectorIds` toe: verwijzingen naar `assets/connectors-data.js`, de single source
of truth voor de gecertificeerde systeemconnectors. Invariant: `riskBreakdown.links`
van een agent is ten minste de hoogste `riskContribution` van zijn connectors.

`assets/audit-data.js` bevat de voorbeeld-audittrail. Elke entry valideert tegen
`schemas/audit-log-entry.schema.json`; de hashketen is in de browser naverekenbaar met
`entry_hash = SHA-256(transaction_id | timestamp | prev_entry_hash ?? "genesis")`.

## Verder lezen

- `ARCHITECTURE.md` — platformlagen, dataflows, hostingmodellen, feature flags
- `DECISIONS.md` — beslislog met onderbouwing
- `CHANGELOG.md` — wijzigingslog
