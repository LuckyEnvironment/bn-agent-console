# Beslislog

Elke beslissing één regel onderbouwing, conform de werkafspraak uit plan 10/7.

| # | Datum | Beslissing | Onderbouwing |
| --- | --- | --- | --- |
| 1 | 2026-07-10 | `index.html` hersteld uit git i.p.v. `bn-agent-landingpage.html` te promoveren | Alle pagina's linken naar `index.html` en die versie gebruikt het gedeelde tokens-designsysteem; de landingpage-variant blijft staan als marketingalternatief. |
| 2 | 2026-07-10 | Dode "Kennisbank"-navlinks vervangen door "Audit-trail" | De kennisbankpagina bestond niet; de audittrail is het ontbrekende kernonderdeel uit het plan en verdient de navplek. |
| 3 | 2026-07-10 | Agent Card v1.1-velden als merge-extensie (`BN_CARD_EXTENSIONS`) onderaan `agents-data.js` | Basisdataset blijft onaangetast en reviewbaar; elke consument (registry, detail, export) ziet via de merge toch één volledig kaartobject. |
| 4 | 2026-07-10 | Code-/card-hashes deterministisch afgeleid (SHA-256 van id+versie) | Echte digests met stabiele regeneratie — demodata blijft reproduceerbaar zonder hashes te hoeven verzinnen. |
| 5 | 2026-07-10 | WORM-ketenformule `SHA-256(tx \| timestamp \| prev)` i.p.v. hash over de hele entry | Canonicalisatie van volledige JSON verschilt tussen Python en JS; deze formule maakt de keten in de browser live naverekenbaar — sterkere demo van het WORM-principe. |
| 6 | 2026-07-10 | `system_integrity` als vijfde verplicht blok in het auditschema | Het logvelden-document stelt categorie D (DORA-check) verplicht; het JSON-voorbeeld uit het plan miste dit blok. |
| 7 | 2026-07-10 | Conditionele schemaregels: OVERRIDE ⇒ motivatie + handtekening; HITL-gate ⇒ gate-metadata | De verplichte override-motivatie is het belangrijkste compliance-veld uit het manifest; het schema moet dat afdwingen, niet alleen documenteren. |
| 8 | 2026-07-10 | Voorbeeldmodellen benoemd als `anthropic.claude-sonnet-4-6` / `claude-haiku-4-5` via AWS Bedrock (EU) | Actuele, correcte Bedrock-model-ID's per juli 2026; het plan noemde het verouderde claude-3-5-sonnet. |
| 9 | 2026-07-10 | Audit- en check-API's als routes op de bestaande `@/server`-domeinlaag, WORM-backend achter `AUDIT_WORM_BACKEND` | Consistent met de bestaande route-stijl (scopes, Nederlandse fouten, veiligheidskleppen); zonder backend hoort ingest hard te falen i.p.v. stil logs te verliezen. |
| 10 | 2026-07-10 | cv-screen-025 als demonstratie van "niet ondertekend/bevroren" i.p.v. een aparte kapotte agent | Eén Annex III-agent zonder certificering laat de hash-breuk/bevriezingsflow zien op detail- én checkpagina zonder extra kunstmatige data. |
| 11 | 2026-07-10 | Geen apart productieteam van subagents ingezet | Het werk is designcoherent over één codebase; opsplitsen zou contextverlies en stijlbreuken opleveren, terwijl het plan de keuze expliciet vrijliet. |
| 12 | 2026-07-10 | Veiligheidsklep gerespecteerd: alle data fictief, escrow-payloads blijven geweigerd | Het plan pauzeert alleen bij blootstelling van cliëntgevoelige data; die situatie doet zich met synthetische demodata niet voor. |
