// BN Agent — shared sample-agent dataset (Agent Card Standaard v2.0, public preview subset).
// Single source of truth for the registry preview, the demo console, the homepage
// and the agent-detail page. Scores follow Boek VIII:
//   riskFactor  = weighted sum of riskBreakdown (static, 0-100, lower is better)
//   trustScore  = dynamic performance score (0-100, higher is better)
//   hireTier    = derived A/B/C/D from both classes.
// Invariant 1: sum(riskBreakdown[k] * BN_RISK_MODEL.weights[k]) === riskFactor.
// Invariant 2 (v2.0): riskBreakdown.links >= max(riskContribution) van de gekoppelde
//   connectors (connectorIds -> assets/connectors-data.js) — een agent kan nooit een
//   lagere koppelingsscore claimen dan zijn zwaarste gecertificeerde connector.
// v2.0 = v1.1 + connectorIds: verwijzingen naar gecertificeerde systeemconnectors
// (bnc:connector:*) uit assets/connectors-data.js.

window.BN_RISK_MODEL = {
  weights: { data: 0.30, impact: 0.25, autonomy: 0.20, links: 0.15, recovery: 0.10 },
  labels: {
    data: "Datagevoeligheid",
    impact: "Beslissingsimpact",
    autonomy: "Autonomie",
    links: "Koppelingen",
    recovery: "Herstelbaarheid"
  },
  descriptions: {
    data: "Gevoeligheid van de verwerkte gegevens (persoonsgegevens, financieel, bijzondere categorieën)",
    impact: "Gevolg van een onjuiste beslissing voor betrokkene of organisatie",
    autonomy: "Mate waarin de agent zonder menselijke review handelt",
    links: "Afhankelijkheid van externe bronnen en systemen",
    recovery: "Hoe moeilijk een onjuiste uitkomst terug te draaien is"
  },
  riskClasses: [
    { max: 30, label: "laag" },
    { max: 55, label: "gemiddeld" },
    { max: 75, label: "verhoogd" },
    { max: 100, label: "hoog" }
  ],
  trustClasses: [
    { min: 80, label: "hoog" },
    { min: 60, label: "gemiddeld" },
    { min: 40, label: "beperkt" },
    { min: 0, label: "onvoldoende" }
  ]
};

window.BN_AGENTS = [
  {
    agentId: "bna:agent:kyc-screen-004",
    name: "KYC Screening Agent",
    provider: "ComplianceWorks B.V.",
    sector: "Finance",
    distribution: "lease",
    version: "2.3.1",
    releasedAt: "2026-05-12",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:kyc-screen-004",
    description: "Geïntegreerde KYC-verificatie: sanctielijsten, PEP-screening en UBO-controle met volledige audittrail per beslissing.",
    capabilities: ["kyc.screen", "sanctions.check", "ubo.resolve"],
    connectorIds: ["bnc:connector:kvk-handelsregister"],
    certification: { books: ["II", "IV", "VI"], status: "gecertificeerd", validUntil: "2027-03" },
    annexIII: true,
    riskFactor: 62,
    riskBreakdown: { data: 78, impact: 72, autonomy: 40, links: 60, recovery: 36 },
    trustScore: 88,
    trustMetrics: { audittrail: "99,2%", incidents90d: 0, sla: "96%", uptime: "99,9%" },
    hireTier: "B",
    avg: {
      grondslag: "wettelijke verplichting (Wwft)",
      dpia: true,
      bewaartermijn: "5 jaar (Wwft-dossierplicht), logs 18 maanden",
      verwerkersovereenkomst: "aanwezig, incl. subverwerkers",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["sanctions.data", "ubo.register"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:credit-assess-007",
    name: "Kredietbeoordeling Agent",
    provider: "NoordKrediet Analytics",
    sector: "Finance",
    distribution: "lease",
    version: "1.8.0",
    releasedAt: "2026-04-02",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:credit-assess-007",
    description: "Kredietrisicoscoring voor MKB-aanvragen op basis van jaarrekeningen en transactiedata. Annex III-traject loopt; certificering parallel aan pilots.",
    capabilities: ["credit.score", "financials.parse"],
    connectorIds: ["bnc:connector:kvk-handelsregister", "bnc:connector:bkr-toetsing"],
    certification: { books: ["II"], status: "in certificering", validUntil: null },
    annexIII: true,
    riskFactor: 74,
    riskBreakdown: { data: 85, impact: 80, autonomy: 70, links: 60, recovery: 55 },
    trustScore: 61,
    trustMetrics: { audittrail: "91,4%", incidents90d: 1, sla: "88%", uptime: "99,2%" },
    hireTier: "C",
    avg: {
      grondslag: "gerechtvaardigd belang",
      dpia: true,
      bewaartermijn: "7 jaar (kredietdossier), logs 24 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["market.data", "financials.registry"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:trade-recap-011",
    name: "Trade Recap Extractie Agent",
    provider: "Amstel Capital Tech",
    sector: "Finance",
    distribution: "koop",
    version: "3.1.4",
    releasedAt: "2026-06-20",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:trade-recap-011",
    description: "Extraheert gestructureerde trade recaps en SFA-documentvelden uit ongestructureerde dealdocumentatie voor private equity en banking.",
    capabilities: ["doc.extract", "trade.recap", "sfa.parse"],
    connectorIds: [],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-01" },
    annexIII: false,
    riskFactor: 28,
    riskBreakdown: { data: 40, impact: 28, autonomy: 20, links: 24, recovery: 14 },
    trustScore: 93,
    trustMetrics: { audittrail: "99,8%", incidents90d: 0, sla: "98%", uptime: "99,9%" },
    hireTier: "A",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "duur van de opdracht, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["market.data"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:sfa-parser-012",
    name: "SFA Document Parser",
    provider: "Amstel Capital Tech",
    sector: "Finance",
    distribution: "lease",
    version: "2.0.2",
    releasedAt: "2026-06-20",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:sfa-parser-012",
    description: "Parseert Senior Facilities Agreements en covenant-structuren naar machine-leesbare velden, met bronverwijzing per clausule.",
    capabilities: ["sfa.parse", "covenant.extract"],
    connectorIds: [],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-01" },
    annexIII: false,
    riskFactor: 35,
    riskBreakdown: { data: 45, impact: 38, autonomy: 25, links: 30, recovery: 25 },
    trustScore: 84,
    trustMetrics: { audittrail: "98,9%", incidents90d: 0, sla: "94%", uptime: "99,7%" },
    hireTier: "B",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "duur van de opdracht, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["sfa.documents"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:marketdata-031",
    name: "Marktdata Feed Agent",
    provider: "Beurs & Bron Data",
    sector: "Finance",
    distribution: "koop",
    version: "1.4.0",
    releasedAt: "2026-05-28",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:marketdata-031",
    description: "Levert gelicentieerde koers- en marktdata als geverifieerde databron aan andere agents, met bronattributie en gebruikslimieten via Escrow.",
    capabilities: ["market.data", "escrow.provide"],
    connectorIds: ["bnc:connector:generic-rest"],
    certification: { books: ["II", "VI"], status: "gecertificeerd", validUntil: "2027-04" },
    annexIII: false,
    riskFactor: 33,
    riskBreakdown: { data: 40, impact: 32, autonomy: 25, links: 40, recovery: 20 },
    trustScore: 87,
    trustMetrics: { audittrail: "99,5%", incidents90d: 0, sla: "97%", uptime: "99,8%" },
    hireTier: "B",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "geen persoonsgegevens; gebruikslogs 12 maanden",
      verwerkersovereenkomst: "n.v.t. (geen persoonsgegevens)",
      eerDoorgifte: "n.v.t."
    },
    escrow: { role: "aanbieder", provides: ["market.data"], minScoreRequired: 80 }
  },
  {
    agentId: "bna:agent:dora-report-034",
    name: "DORA Incidentrapportage Agent",
    provider: "RegTech Nederland",
    sector: "Finance",
    distribution: "lease",
    version: "1.1.3",
    releasedAt: "2026-07-01",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:dora-report-034",
    description: "Stelt DORA-conforme incidentrapportages op met tijdlijnreconstructie uit logging en bewaakt de wettelijke meldtermijnen.",
    capabilities: ["incident.report", "dora.timeline"],
    connectorIds: ["bnc:connector:generic-rest"],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-06" },
    annexIII: false,
    riskFactor: 45,
    riskBreakdown: { data: 50, impact: 52, autonomy: 40, links: 40, recovery: 30 },
    trustScore: 82,
    trustMetrics: { audittrail: "99,1%", incidents90d: 0, sla: "93%", uptime: "99,6%" },
    hireTier: "B",
    avg: {
      grondslag: "wettelijke verplichting (DORA)",
      dpia: false,
      bewaartermijn: "conform DORA-rapportageplicht, logs 24 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:pay-remind-015",
    name: "Betaalherinnering Agent",
    provider: "FactuurFlow",
    sector: "Administratie",
    distribution: "koop",
    version: "4.2.0",
    releasedAt: "2026-03-15",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:pay-remind-015",
    description: "Genereert en verstuurt betaalherinneringen volgens instelbaar escalatieprotocol, inclusief toonregels per debiteurensegment.",
    capabilities: ["invoice.remind", "dunning.schedule"],
    connectorIds: ["bnc:connector:exact-online"],
    certification: { books: ["II", "IV", "VI"], status: "gecertificeerd", validUntil: "2026-11" },
    annexIII: false,
    riskFactor: 18,
    riskBreakdown: { data: 20, impact: 20, autonomy: 15, links: 20, recovery: 10 },
    trustScore: 95,
    trustMetrics: { audittrail: "99,9%", incidents90d: 0, sla: "99%", uptime: "99,9%" },
    hireTier: "A",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "debiteurendossier 7 jaar, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["fleet.telemetry"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:fleet-link-019",
    name: "Wagenpark Data Agent",
    provider: "MobiData Benelux",
    sector: "Mobiliteit",
    distribution: "lease",
    version: "2.5.1",
    releasedAt: "2026-04-22",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:fleet-link-019",
    description: "Ontsluit wagenparkkoppelingen (kilometerstanden, onderhoudsstatus, laaddata) als geverifieerde databron voor andere agents via Escrow.",
    capabilities: ["fleet.telemetry", "escrow.provide"],
    connectorIds: ["bnc:connector:ocpi-laadinfra", "bnc:connector:generic-rest"],
    certification: { books: ["II", "VI"], status: "gecertificeerd", validUntil: "2027-05" },
    annexIII: false,
    riskFactor: 41,
    riskBreakdown: { data: 50, impact: 36, autonomy: 40, links: 44, recovery: 24 },
    trustScore: 79,
    trustMetrics: { audittrail: "98,2%", incidents90d: 1, sla: "92%", uptime: "99,4%" },
    hireTier: "B",
    avg: {
      grondslag: "gerechtvaardigd belang",
      dpia: true,
      bewaartermijn: "telemetrie 24 maanden, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig, incl. subverwerkers",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "aanbieder", provides: ["fleet.telemetry"], minScoreRequired: 75 }
  },
  {
    agentId: "bna:agent:lex-validate-022",
    name: "Taalvalidatie Agent",
    provider: "Lexis Datadiensten",
    sector: "Data & Media",
    distribution: "koop",
    version: "5.0.0",
    releasedAt: "2026-02-10",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:lex-validate-022",
    description: "Valideert en normaliseert Nederlandstalige content tegen gelicentieerde woordenboekdata; levert correctievoorstellen met bronvermelding.",
    capabilities: ["text.validate", "lexicon.lookup"],
    connectorIds: [],
    certification: { books: ["II"], status: "gecertificeerd", validUntil: "2027-02" },
    annexIII: false,
    riskFactor: 12,
    riskBreakdown: { data: 12, impact: 12, autonomy: 12, links: 12, recovery: 12 },
    trustScore: 91,
    trustMetrics: { audittrail: "99,6%", incidents90d: 0, sla: "98%", uptime: "99,9%" },
    hireTier: "A",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "geen opslag van klantcontent na verwerking, logs 6 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["lexicon.data"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:cv-screen-025",
    name: "CV-Screening Agent",
    provider: "TalentSelect AI",
    sector: "HR",
    distribution: "lease",
    version: "0.9.2",
    releasedAt: "2026-06-05",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:cv-screen-025",
    description: "Voorselectie van kandidaten op functie-eisen. Annex III-categorie: inhuur geblokkeerd tot volledige certificering en bias-audit zijn afgerond.",
    capabilities: ["cv.screen", "match.rank"],
    connectorIds: ["bnc:connector:generic-rest"],
    certification: { books: [], status: "aangemeld", validUntil: null },
    annexIII: true,
    riskFactor: 86,
    riskBreakdown: { data: 90, impact: 90, autonomy: 85, links: 80, recovery: 75 },
    trustScore: 34,
    trustMetrics: { audittrail: "62,0%", incidents90d: 3, sla: "71%", uptime: "97,1%" },
    hireTier: "D",
    avg: {
      grondslag: "toestemming",
      dpia: true,
      bewaartermijn: "4 weken na afronding procedure (sollicitatienorm)",
      verwerkersovereenkomst: "in beoordeling",
      eerDoorgifte: "in beoordeling"
    },
    escrow: { role: "geen" }
  },
  // ── v2.0-uitbreiding van de registry: Zorg, Overheid, Legal, Verzekeringen,
  //    HR en Vastgoed. Zelfde Boek VIII-invarianten als de basisset. ──────────
  {
    agentId: "bna:agent:triage-zorg-041",
    name: "Zorgtriage Agent",
    provider: "MediFlow Zorgtechnologie",
    sector: "Zorg",
    distribution: "lease",
    version: "1.6.2",
    releasedAt: "2026-06-14",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:triage-zorg-041",
    description: "Ondersteunt huisartsenposten bij telefonische triage: urgentie-inschatting volgens NTS-standaard met verplichte verpleegkundige autorisatie per advies.",
    capabilities: ["zorg.triage", "nts.classify"],
    connectorIds: ["bnc:connector:digid"],
    certification: { books: ["II", "IV", "VI"], status: "gecertificeerd", validUntil: "2027-05" },
    annexIII: true,
    riskFactor: 69,
    riskBreakdown: { data: 90, impact: 84, autonomy: 30, links: 70, recovery: 45 },
    trustScore: 86,
    trustMetrics: { audittrail: "99,4%", incidents90d: 0, sla: "97%", uptime: "99,9%" },
    hireTier: "B",
    avg: {
      grondslag: "uitvoering behandelovereenkomst (WGBO)",
      dpia: true,
      bewaartermijn: "medisch dossier 20 jaar (WGBO), logs 18 maanden",
      verwerkersovereenkomst: "aanwezig, incl. subverwerkers",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:decl-check-042",
    name: "Declaratiecontrole Agent",
    provider: "ZorgAdmin Solutions",
    sector: "Zorg",
    distribution: "koop",
    version: "3.0.1",
    releasedAt: "2026-05-08",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:decl-check-042",
    description: "Controleert zorgdeclaraties op DBC-codering, tariefafspraken en dubbele indiening vóór verzending naar de zorgverzekeraar.",
    capabilities: ["declaratie.check", "dbc.validate"],
    connectorIds: [],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-02" },
    annexIII: false,
    riskFactor: 30,
    riskBreakdown: { data: 40, impact: 32, autonomy: 20, links: 32, recovery: 12 },
    trustScore: 92,
    trustMetrics: { audittrail: "99,7%", incidents90d: 0, sla: "98%", uptime: "99,9%" },
    hireTier: "A",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: true,
      bewaartermijn: "declaratiedossier 7 jaar, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:woo-redact-045",
    name: "Woo-lakassistent",
    provider: "GovTech Nederland",
    sector: "Overheid",
    distribution: "lease",
    version: "2.2.0",
    releasedAt: "2026-04-30",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:woo-redact-045",
    description: "Stelt lakvoorstellen op voor Woo-verzoeken: markeert persoonsgegevens en uitzonderingsgronden per passage, met verplichte juridische eindcontrole.",
    capabilities: ["woo.redact", "doc.classify"],
    connectorIds: ["bnc:connector:ms-graph"],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-03" },
    annexIII: false,
    riskFactor: 49,
    riskBreakdown: { data: 70, impact: 48, autonomy: 25, links: 48, recovery: 38 },
    trustScore: 84,
    trustMetrics: { audittrail: "99,0%", incidents90d: 0, sla: "95%", uptime: "99,7%" },
    hireTier: "B",
    avg: {
      grondslag: "wettelijke verplichting (Woo)",
      dpia: true,
      bewaartermijn: "conform Archiefwet, logs 18 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:vergunning-check-048",
    name: "Vergunningcheck Agent",
    provider: "GovTech Nederland",
    sector: "Overheid",
    distribution: "lease",
    version: "0.8.4",
    releasedAt: "2026-06-28",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:vergunning-check-048",
    description: "Toetst vergunningaanvragen (Omgevingswet) op volledigheid en strijdigheid met het omgevingsplan. Annex III-traject loopt; besluiten blijven volledig bij de behandelaar.",
    capabilities: ["vergunning.check", "omgevingsplan.match"],
    connectorIds: ["bnc:connector:digid", "bnc:connector:eherkenning", "bnc:connector:kvk-handelsregister"],
    certification: { books: ["II"], status: "in certificering", validUntil: null },
    annexIII: true,
    riskFactor: 63,
    riskBreakdown: { data: 60, impact: 76, autonomy: 55, links: 60, recovery: 60 },
    trustScore: 58,
    trustMetrics: { audittrail: "90,8%", incidents90d: 1, sla: "87%", uptime: "99,1%" },
    hireTier: "C",
    avg: {
      grondslag: "taak van algemeen belang (Omgevingswet)",
      dpia: true,
      bewaartermijn: "conform Archiefwet, logs 24 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:contract-review-051",
    name: "Contract Review Agent",
    provider: "LegalMind B.V.",
    sector: "Legal",
    distribution: "koop",
    version: "1.9.0",
    releasedAt: "2026-05-19",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:contract-review-051",
    description: "Reviewt commerciële contracten tegen een instelbaar clausule-playbook: afwijkingen, ontbrekende bepalingen en risicopassages met bronverwijzing per bevinding.",
    capabilities: ["contract.review", "clause.match"],
    connectorIds: ["bnc:connector:ms-graph"],
    certification: { books: ["II", "IV"], status: "gecertificeerd", validUntil: "2027-04" },
    annexIII: false,
    riskFactor: 30,
    riskBreakdown: { data: 30, impact: 32, autonomy: 20, links: 48, recovery: 18 },
    trustScore: 90,
    trustMetrics: { audittrail: "99,6%", incidents90d: 0, sla: "97%", uptime: "99,8%" },
    hireTier: "A",
    avg: {
      grondslag: "uitvoering overeenkomst",
      dpia: false,
      bewaartermijn: "duur van de opdracht, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:claim-intake-054",
    name: "Schadeclaim Intake Agent",
    provider: "AssurTech Benelux",
    sector: "Verzekeringen",
    distribution: "lease",
    version: "2.4.3",
    releasedAt: "2026-06-02",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:claim-intake-054",
    description: "Neemt schadeclaims gestructureerd in: dekkingscheck, documentclassificatie en fraude-indicatoren. Uitkeringsbeslissingen blijven bij de schadebehandelaar.",
    capabilities: ["claim.intake", "coverage.check", "fraud.flag"],
    connectorIds: ["bnc:connector:idin", "bnc:connector:salesforce"],
    certification: { books: ["II", "VI"], status: "gecertificeerd", validUntil: "2027-05" },
    annexIII: false,
    riskFactor: 52,
    riskBreakdown: { data: 60, impact: 56, autonomy: 40, links: 52, recovery: 42 },
    trustScore: 81,
    trustMetrics: { audittrail: "98,8%", incidents90d: 0, sla: "94%", uptime: "99,6%" },
    hireTier: "B",
    avg: {
      grondslag: "uitvoering verzekeringsovereenkomst",
      dpia: true,
      bewaartermijn: "schadedossier 7 jaar, logs 18 maanden",
      verwerkersovereenkomst: "aanwezig, incl. subverwerkers",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:verzuim-signal-057",
    name: "Verzuimsignalering Agent",
    provider: "HRInzicht B.V.",
    sector: "HR",
    distribution: "lease",
    version: "0.5.1",
    releasedAt: "2026-07-03",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:verzuim-signal-057",
    description: "Signaleert verzuimpatronen voor casemanagers. Annex III-categorie: inhuur geblokkeerd tot certificering, bias-audit en AP-consultatie zijn afgerond.",
    capabilities: ["verzuim.signal", "pattern.detect"],
    connectorIds: [],
    certification: { books: [], status: "aangemeld", validUntil: null },
    annexIII: true,
    riskFactor: 79,
    riskBreakdown: { data: 90, impact: 84, autonomy: 75, links: 60, recovery: 70 },
    trustScore: 41,
    trustMetrics: { audittrail: "71,5%", incidents90d: 2, sla: "78%", uptime: "98,3%" },
    hireTier: "D",
    avg: {
      grondslag: "in beoordeling (gerechtvaardigd belang vs. toestemming)",
      dpia: true,
      bewaartermijn: "verzuimdossier 2 jaar na herstel, logs 12 maanden",
      verwerkersovereenkomst: "in beoordeling",
      eerDoorgifte: "in beoordeling"
    },
    escrow: { role: "geen" }
  },
  {
    agentId: "bna:agent:woz-taxatie-060",
    name: "WOZ-taxatie Agent",
    provider: "VastgoedData NL",
    sector: "Vastgoed",
    distribution: "koop",
    version: "1.3.0",
    releasedAt: "2026-03-27",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:woz-taxatie-060",
    description: "Ondersteunt gemeentelijke taxateurs met modelmatige WOZ-waardering: referentieobjecten, marktanalyse en onderbouwing per beschikking.",
    capabilities: ["woz.valuate", "market.compare"],
    connectorIds: ["bnc:connector:kvk-handelsregister", "bnc:connector:generic-rest"],
    certification: { books: ["II", "IV", "VI"], status: "gecertificeerd", validUntil: "2027-01" },
    annexIII: false,
    riskFactor: 48,
    riskBreakdown: { data: 50, impact: 60, autonomy: 35, links: 48, recovery: 38 },
    trustScore: 77,
    trustMetrics: { audittrail: "98,5%", incidents90d: 1, sla: "93%", uptime: "99,5%" },
    hireTier: "B",
    avg: {
      grondslag: "wettelijke verplichting (Wet WOZ)",
      dpia: true,
      bewaartermijn: "taxatiedossier 7 jaar, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "afnemer", consumes: ["market.data"], minScoreRequired: null }
  },
  {
    agentId: "bna:agent:huurindex-063",
    name: "Huurindexatie Agent",
    provider: "VastgoedData NL",
    sector: "Vastgoed",
    distribution: "koop",
    version: "2.1.0",
    releasedAt: "2026-02-18",
    discoveryUri: "https://registry.bn-agent.com/v1/agents/bna:agent:huurindex-063",
    description: "Berekent huurindexaties en stelt indexatiebrieven op. Geschorst: de code-hash wijkt af van de ondertekende Agent Card — agent bevroren tot hervalidatie.",
    capabilities: ["huur.index", "brief.generate"],
    connectorIds: ["bnc:connector:exact-online"],
    certification: { books: ["II"], status: "geschorst", validUntil: null },
    annexIII: false,
    riskFactor: 40,
    riskBreakdown: { data: 30, impact: 40, autonomy: 45, links: 60, recovery: 30 },
    trustScore: 35,
    trustMetrics: { audittrail: "84,2%", incidents90d: 2, sla: "81%", uptime: "99,0%" },
    hireTier: "D",
    avg: {
      grondslag: "uitvoering huurovereenkomst",
      dpia: false,
      bewaartermijn: "huurdossier 7 jaar, logs 12 maanden",
      verwerkersovereenkomst: "aanwezig",
      eerDoorgifte: "geen doorgifte buiten de EER"
    },
    escrow: { role: "geen" }
  }
];

window.BN_TIER_LABELS = { A: "Tier A", B: "Tier B", C: "Tier C", D: "Tier D" };
window.BN_TIER_MEANING = {
  A: "direct inhuurbaar",
  B: "inhuurbaar met logging",
  C: "beperkt, onder toezicht",
  D: "niet inhuurbaar"
};
window.bnRiskColor = function (rf) {
  if (rf <= 30) return "var(--green)";
  if (rf <= 55) return "var(--teal)";
  if (rf <= 75) return "var(--amber)";
  return "var(--red)";
};
window.bnAgentById = function (id) {
  return window.BN_AGENTS.find(function (a) { return a.agentId === id; }) || null;
};
window.bnRiskClass = function (rf) {
  return window.BN_RISK_MODEL.riskClasses.find(function (c) { return rf <= c.max; }).label;
};
window.bnTrustClass = function (ts) {
  return window.BN_RISK_MODEL.trustClasses.find(function (c) { return ts >= c.min; }).label;
};

// ── Agent Card Standaard v1.1 — uitbreiding ─────────────────────────────
// Vier datablokken per agent (Wft / EU AI Act): functional (de 'wat'),
// architecture (de 'hoe'), guardrails (de 'veiligheid'), complianceCheck
// (de 'Wft/AFM-check') + integrity (code/card-hash, ondertekening) en
// riskLevel (risico-barometer 1-5, zoals bij beleggingsfondsen).
// Invariant: integrity.status !== "geldig" => agent niet autonoom inzetbaar;
// wijzigt de code, dan breekt codeHash en wordt de kaart ongeldig.
window.BN_CARD_EXTENSIONS = {
  "bna:agent:kyc-screen-004": {
    "riskLevel": 4,
    "functional": {
      "intent": "Geautomatiseerde KYC-verificatie van zakelijke relaties: sanctielijsten, PEP-screening en UBO-controle, met audittrail per beslissing.",
      "inputs": [
        "KVK-nummer of bedrijfsnaam",
        "identificatiedocument (PDF/scan)",
        "UBO-verklaring"
      ],
      "outputs": [
        "KYC-rapport (gestructureerde JSON + PDF)",
        "risicoscore per relatie"
      ],
      "hitlTrigger": "Bij elke hit op een sanctie- of PEP-lijst en bij UBO-onzekerheid bevriest de agent de output; vrijgave vereist goedkeuring van een Wwft-bevoegde medewerker met digitale handtekening."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1, Nitro Enclave",
      "connectors": [
        "KVK API",
        "EU/UN/OFAC-sanctielijsten (Dow Jones)",
        "UBO-register"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Zero-data-retention richting modelprovider; KYC-dossier 5 jaar (Wwft), logs 18 maanden in WORM-opslag",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "iban",
        "geboortedatum"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-05",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke beslissing logt bronvermelding (lijst, versie, response-hash) en chain-of-thought naar de audittrail."
    },
    "integrity": {
      "codeHash": "f9e10e3b13461f97adbb5186fe9808944e6b48febcf955c42ad4d4b6718d2d44",
      "cardHash": "c0bf419d1d6325a10a22b8be5481056d635c4384621640ea5c48414e9cf5f872",
      "signedAt": "2026-05-12T09:14:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:kyc-screen-004"
    }
  },
  "bna:agent:credit-assess-007": {
    "riskLevel": 4,
    "functional": {
      "intent": "Kredietrisicoscoring voor MKB-aanvragen op basis van jaarrekeningen en transactiedata.",
      "inputs": [
        "jaarrekening (PDF/XBRL)",
        "banktransactie-export (CAMT.053)",
        "sectorcode (SBI)"
      ],
      "outputs": [
        "kredietscore met bandbreedte",
        "onderbouwingsrapport (JSON)"
      ],
      "hitlTrigger": "Elke score die tot afwijzing zou leiden gaat verplicht langs een kredietacceptant; de agent geeft nooit zelfstandig een afwijzing af (AVG art. 22)."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1) + eigen scoringsmodel (XGBoost)",
      "infrastructure": "BYOC: draait binnen de Azure-tenant van de afnemer (EU-West), platform levert alleen registry en logging",
      "connectors": [
        "KVK API",
        "BKR-toetsing",
        "PSD2-rekeninginformatie (via vergunninghoudende AISP)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (Azure West-Europe, tenant van afnemer)",
      "zeroDataRetention": true,
      "retention": "Kredietdossier 7 jaar, logs 24 maanden; prompts direct gewist na generatie",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "iban"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-06",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — feature-attributie per score plus chain-of-thought van de LLM-onderbouwing in het auditlog."
    },
    "integrity": {
      "codeHash": "0a96fef77476a3e8e4fdfec683afcd2b871c7c07ca6c8c1155beb937087e2d8e",
      "cardHash": null,
      "signedAt": null,
      "status": "in validatie",
      "checkUrl": "bn-agent-check.html?id=bna:agent:credit-assess-007"
    }
  },
  "bna:agent:trade-recap-011": {
    "riskLevel": 2,
    "functional": {
      "intent": "Extraheert gestructureerde trade recaps en SFA-documentvelden uit ongestructureerde dealdocumentatie.",
      "inputs": [
        "dealdocumentatie (PDF/DOCX)",
        "term sheets",
        "e-mailthreads (EML)"
      ],
      "outputs": [
        "trade recap (gestructureerde JSON)",
        "Excel-model met dealvelden"
      ],
      "hitlTrigger": "Extracties met confidence < 0,95 op materiële velden (bedragen, tegenpartijen, data) worden ter review voorgelegd vóór export."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "geen externe API's — verwerkt uitsluitend aangeleverde documenten"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Documenten alleen in-memory tijdens verwerking; logs 12 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen",
        "contactgegevens"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-04",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elk geëxtraheerd veld verwijst naar paginanummer en tekstfragment in het brondocument."
    },
    "integrity": {
      "codeHash": "58ffc34d89be9671e582b81ad6eac6b0092309140eaaffad6bbf678620bae1b6",
      "cardHash": "2f6bb03545b7b6688da5d1bc4a2f75f921d3378f987a887902de75673efa30cc",
      "signedAt": "2026-06-20T14:02:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:trade-recap-011"
    }
  },
  "bna:agent:sfa-parser-012": {
    "riskLevel": 2,
    "functional": {
      "intent": "Parseert Senior Facilities Agreements en covenant-structuren naar machine-leesbare velden.",
      "inputs": [
        "SFA-document (PDF)",
        "covenant-definitielijst (optioneel)"
      ],
      "outputs": [
        "clausule-index met bronverwijzing (JSON)",
        "covenant-overzicht (Excel)"
      ],
      "hitlTrigger": "Clausules die de agent als 'afwijkend van marktstandaard' markeert vereisen juridische review vóór opname in het covenant-overzicht."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "geen externe API's — verwerkt uitsluitend aangeleverde documenten"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Documenten alleen in-memory tijdens verwerking; logs 12 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-04",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — bronverwijzing per clausule (pagina, artikelnummer, tekstanker)."
    },
    "integrity": {
      "codeHash": "91e5d3a25f96c4730550487136ec016d87bd42a3a408dfd1ab2e92f4e5de5d2d",
      "cardHash": "2c4ffd547296c9e8aa1c0246068fceb7e31f8495314a7e79554526c568ca7848",
      "signedAt": "2026-06-20T14:31:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:sfa-parser-012"
    }
  },
  "bna:agent:marketdata-031": {
    "riskLevel": 2,
    "functional": {
      "intent": "Levert gelicentieerde koers- en marktdata als geverifieerde databron aan andere agents via de escrow-laag.",
      "inputs": [
        "instrument-identifier (ISIN/ticker)",
        "periode en frequentie"
      ],
      "outputs": [
        "koersreeksen met bronattributie en response-hash (JSON)"
      ],
      "hitlTrigger": "Geen HITL in de leveringsflow; afwijkingen in datakwaliteit (> 3σ t.o.v. referentiebron) pauzeren de feed en alarmeren de beheerder."
    },
    "architecture": {
      "baseModel": "Geen LLM in het leveringspad; Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5) voor kwaliteitsrapportages",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "Euronext-marktdatafeed",
        "ECB-referentiekoersen"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Geen persoonsgegevens; gebruikslogs 12 maanden",
      "piiMasking": []
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-05",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke levering bevat bron, tijdstempel en response-hash zodat historische beslissingen traceerbaar blijven."
    },
    "integrity": {
      "codeHash": "e2b7f98f635c8fd438b456a0250ff9bb823bbaa7338438104cdf86e5e60155ff",
      "cardHash": "5c4e26553ee584739212a8bb68d38bde49912c1f33f4c94fe78c94cc97d40d8d",
      "signedAt": "2026-05-28T10:45:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:marketdata-031"
    }
  },
  "bna:agent:dora-report-034": {
    "riskLevel": 3,
    "functional": {
      "intent": "Stelt DORA-conforme incidentrapportages op met tijdlijnreconstructie uit logging en bewaakt wettelijke meldtermijnen.",
      "inputs": [
        "incident-logexports (SIEM)",
        "incidentclassificatie",
        "contactgegevens meldplichtige"
      ],
      "outputs": [
        "DORA-incidentrapport (conform ITS-template)",
        "tijdlijnreconstructie (JSON)"
      ],
      "hitlTrigger": "Elk rapport wordt vóór indiening bij de toezichthouder ter goedkeuring voorgelegd aan de compliance officer; indienen gebeurt nooit autonoom."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "BYOC: draait binnen de Azure/AWS-omgeving van de financiële instelling",
      "connectors": [
        "SIEM-export (Splunk/Sentinel)",
        "DNB/AFM-meldportaal (voorbereiding, geen automatische indiening)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (omgeving van afnemer)",
      "zeroDataRetention": true,
      "retention": "Conform DORA-rapportageplicht; logs 24 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen",
        "ip_adressen",
        "e-mailadressen"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-06",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke rapportregel verwijst naar de onderliggende logregels (bron-ID en hash)."
    },
    "integrity": {
      "codeHash": "67821448c00f4448d3336eb79cc122c1c3bacf1b4720690bad687d2ee5da5b17",
      "cardHash": "d1944fcfb29b9bde991f6ba1b58e058bd7b3c5d902cf62a072537f2c6014208b",
      "signedAt": "2026-07-01T08:20:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:dora-report-034"
    }
  },
  "bna:agent:pay-remind-015": {
    "riskLevel": 1,
    "functional": {
      "intent": "Genereert en verstuurt betaalherinneringen volgens een instelbaar escalatieprotocol.",
      "inputs": [
        "openstaande-postenlijst (CSV/UBL)",
        "debiteurensegmentatie",
        "toonregels per segment"
      ],
      "outputs": [
        "verzonden herinneringen (e-mail)",
        "escalatierapport (JSON)"
      ],
      "hitlTrigger": "Escalatiestap 3 (aanmaning met incasso-aankondiging) vereist expliciete goedkeuring per debiteur."
    },
    "architecture": {
      "baseModel": "Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "boekhoudkoppeling (Exact/Twinfield)",
        "e-mailgateway (EU)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Debiteurendossier 7 jaar, logs 12 maanden",
      "piiMasking": [
        "iban",
        "contactgegevens_prive"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-03",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — per herinnering wordt template, toonregel en beslisregel gelogd."
    },
    "integrity": {
      "codeHash": "5c7274ff5a4e19153a0e05a5d4a32f66b92752a076749cb0aa918a0cb8cd4878",
      "cardHash": "85a158b6263c6c4de0a79230d50ee9f0102b6e86a2b70b9bc71a4b5522209893",
      "signedAt": "2026-03-15T11:05:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:pay-remind-015"
    }
  },
  "bna:agent:fleet-link-019": {
    "riskLevel": 3,
    "functional": {
      "intent": "Ontsluit wagenparkkoppelingen (kilometerstanden, onderhoudsstatus, laaddata) als geverifieerde databron voor andere agents.",
      "inputs": [
        "voertuig-identifier (kenteken/VIN)",
        "datacategorie en periode"
      ],
      "outputs": [
        "telemetriereeksen met bronattributie (JSON)"
      ],
      "hitlTrigger": "Nieuwe afnemers en nieuwe datacategorieën vereisen eenmalige goedkeuring van de wagenparkbeheerder (doelbinding)."
    },
    "architecture": {
      "baseModel": "Geen LLM in het leveringspad; regelgebaseerde normalisatie",
      "infrastructure": "BYOC: connector draait binnen de cloudomgeving van de leasemaatschappij",
      "connectors": [
        "OEM-telematica-API's",
        "laadpaalbackends (OCPI)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (omgeving van afnemer)",
      "zeroDataRetention": false,
      "retention": "Telemetrie 24 maanden, logs 12 maanden",
      "piiMasking": [
        "kenteken_pseudonimisering",
        "locatiedata_aggregatie"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-05",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke levering logt bron-API, tijdstempel en toegepaste aggregatie."
    },
    "integrity": {
      "codeHash": "2fe0d8f435f248a9dc89aa561c96384f08da74d564e8475a86435a291a8299c9",
      "cardHash": "b683ee24a7a649fddcfb845ec42abe48f42ff717601320a52ba8697d3a457e4c",
      "signedAt": "2026-04-22T13:40:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:fleet-link-019"
    }
  },
  "bna:agent:lex-validate-022": {
    "riskLevel": 1,
    "functional": {
      "intent": "Valideert en normaliseert Nederlandstalige content tegen gelicentieerde woordenboekdata.",
      "inputs": [
        "tekst (platte tekst/HTML/DOCX)",
        "stijlprofiel (optioneel)"
      ],
      "outputs": [
        "correctievoorstellen met bronvermelding (JSON)"
      ],
      "hitlTrigger": "Geen — de agent doet uitsluitend voorstellen; toepassing gebeurt altijd door de gebruiker."
    },
    "architecture": {
      "baseModel": "Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "gelicentieerde lexicondatabase (Van Dale)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Geen opslag van klantcontent na verwerking; logs 6 maanden",
      "piiMasking": []
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-02",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elk correctievoorstel verwijst naar de lexiconbron en regel."
    },
    "integrity": {
      "codeHash": "ed4098b204fa8a8418dc550e8440aa573676a3932fe39ecfd2e73165ee9f1137",
      "cardHash": "4a4f7e73f7238c8afec5ce07f43f0b51e6166b7523ba87cfc25954c4fb30f75b",
      "signedAt": "2026-02-10T09:00:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:lex-validate-022"
    }
  },
  "bna:agent:cv-screen-025": {
    "riskLevel": 5,
    "functional": {
      "intent": "Voorselectie van kandidaten op functie-eisen (werving en selectie).",
      "inputs": [
        "cv's (PDF/DOCX)",
        "functieprofiel",
        "harde eisen (knock-outcriteria)"
      ],
      "outputs": [
        "gerangschikte kandidatenlijst met motivering"
      ],
      "hitlTrigger": "Volledige HITL vereist: geen enkele afwijzing zonder menselijke beoordeling (AVG art. 22, EU AI Act Annex III)."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "ATS-koppeling (Recruitee/AFAS)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "4 weken na afronding procedure (sollicitatienorm)",
      "piiMasking": [
        "naam",
        "geboortedatum",
        "foto",
        "nationaliteit"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III — werving en selectie)",
      "dora": {
        "tested": false,
        "lastPentest": null,
        "incidentStatus": "n.v.t. — bias-audit loopt"
      },
      "explainability": "In beoordeling — motivering per kandidaat aanwezig, bias-audit nog niet afgerond."
    },
    "integrity": {
      "codeHash": "81613aef6f1a708329cdc5883ff76657dfe6ca065daebb80627b6c942bc663e5",
      "cardHash": null,
      "signedAt": null,
      "status": "niet ondertekend",
      "checkUrl": "bn-agent-check.html?id=bna:agent:cv-screen-025"
    }
  },
  // ── v2.0-batch. Hashes deterministisch afgeleid:
  //    codeHash = SHA-256("code|" + agentId + "|" + version)
  //    cardHash = SHA-256("card|" + agentId + "|" + version)
  "bna:agent:triage-zorg-041": {
    "riskLevel": 5,
    "functional": {
      "intent": "Ondersteunt huisartsenposten bij telefonische triage: urgentie-inschatting volgens de NTS-standaard met verplichte verpleegkundige autorisatie per advies.",
      "inputs": [
        "gespreksnotitie of transcript",
        "ingangsklacht (NTS)",
        "patiëntcontext via toestemmingsgestuurde inzage"
      ],
      "outputs": [
        "urgentieklasse (U0–U5) met onderbouwing",
        "adviesrapport voor de triagist (JSON)"
      ],
      "hitlTrigger": "Elk urgentieadvies wordt vóór communicatie aan de patiënt geautoriseerd door een BIG-geregistreerde triagist; U0/U1-inschattingen escaleren direct naar de regiearts."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1, Nitro Enclave",
      "connectors": [
        "DigiD (patiëntauthenticatie via toestemmingsflow)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Zero-data-retention richting modelprovider; triageverslag naar het HIS van de zorgaanbieder (WGBO 20 jaar), logs 18 maanden in WORM-opslag",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "geboortedatum",
        "medische_identifiers"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III — zorgtriage)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-06",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elk advies logt NTS-regelverwijzing, gebruikte context en chain-of-thought naar de audittrail."
    },
    "integrity": {
      "codeHash": "3968492048435f1cec150d74d9d0b739053133d95a51ec83be4a1a6ecea9fc3c",
      "cardHash": "a00171f969567136b4fca2f674434a73fb955f2d33af9e0026ef9764c5f1ae73",
      "signedAt": "2026-06-14T10:22:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:triage-zorg-041"
    }
  },
  "bna:agent:decl-check-042": {
    "riskLevel": 2,
    "functional": {
      "intent": "Controleert zorgdeclaraties op DBC-codering, tariefafspraken en dubbele indiening vóór verzending naar de zorgverzekeraar.",
      "inputs": [
        "declaratiebatch (XML/EI-standaard)",
        "contractafspraken per verzekeraar",
        "DBC-referentietabellen"
      ],
      "outputs": [
        "gevalideerde batch met bevindingenrapport (JSON)",
        "correctievoorstellen per declaratieregel"
      ],
      "hitlTrigger": "Afgekeurde declaratieregels worden nooit automatisch gecorrigeerd of ingediend; elke correctie vereist accordering door de declaratiemedewerker."
    },
    "architecture": {
      "baseModel": "Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5, eu-central-1) + regelgebaseerde DBC-validatie",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "geen externe API's — verwerkt uitsluitend aangeleverde declaratiebestanden"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Declaratiedossier 7 jaar; batches alleen in-memory tijdens verwerking, logs 12 maanden",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "diagnose_details"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-04",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke bevinding verwijst naar de declaratieregel, de DBC-regel en de contractafspraak die de toets bepaalde."
    },
    "integrity": {
      "codeHash": "f2b5f711c576afb039d5d9aaff6a69745d8e81e16d343d3fd05cb4cd396cdb39",
      "cardHash": "5a2eb820af73517f58241a5376864035438dc1e3804c3c0878ae6af1bd9e0b3b",
      "signedAt": "2026-05-08T09:40:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:decl-check-042"
    }
  },
  "bna:agent:woo-redact-045": {
    "riskLevel": 3,
    "functional": {
      "intent": "Stelt lakvoorstellen op voor Woo-verzoeken: markeert persoonsgegevens en uitzonderingsgronden per passage.",
      "inputs": [
        "documentenset (PDF/DOCX/e-mailarchief)",
        "Woo-verzoek en reikwijdte",
        "uitzonderingsgrondenprofiel"
      ],
      "outputs": [
        "lakvoorstel per passage met uitzonderingsgrond (JSON)",
        "gelakte conceptdocumenten (PDF)"
      ],
      "hitlTrigger": "Geen enkel document verlaat de omgeving zonder juridische eindcontrole; de jurist accordeert of verwerpt elk lakvoorstel afzonderlijk."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "BYOC: draait binnen de Azure-tenant van het bestuursorgaan (EU-West)",
      "connectors": [
        "Microsoft Graph (documentontsluiting M365, alleen-lezen)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (Azure West-Europe, tenant van bestuursorgaan)",
      "zeroDataRetention": true,
      "retention": "Conform Archiefwet; werkkopieën gewist na afronding besluit, logs 18 maanden",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "contactgegevens",
        "handtekeningen"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-03",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elk lakvoorstel logt passage, uitzonderingsgrond (Woo-artikel) en confidence naar de audittrail."
    },
    "integrity": {
      "codeHash": "46f985bebaeb26ec07e332504794d4b585a61f538c52fe29152866d9375f54ed",
      "cardHash": "4afdcac27e9211ccee8fd8877c1e04611f56ea6911f59ffe72daaa4331b36361",
      "signedAt": "2026-04-30T13:15:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:woo-redact-045"
    }
  },
  "bna:agent:vergunning-check-048": {
    "riskLevel": 4,
    "functional": {
      "intent": "Toetst vergunningaanvragen (Omgevingswet) op volledigheid en strijdigheid met het omgevingsplan.",
      "inputs": [
        "aanvraagdossier (DSO-export)",
        "omgevingsplan en beleidsregels",
        "indieningsvereisten per activiteit"
      ],
      "outputs": [
        "volledigheids- en strijdigheidsrapport (JSON)",
        "concept-verzoek om aanvulling"
      ],
      "hitlTrigger": "De agent adviseert uitsluitend; elk besluit (buiten behandeling stellen, vergunnen, weigeren) wordt genomen en gemotiveerd door de behandelend ambtenaar (Awb art. 3:46)."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "DigiD (particuliere aanvragers)",
        "eHerkenning (zakelijke aanvragers)",
        "KVK Handelsregister API"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Conform Archiefwet; logs 24 maanden in WORM-opslag",
      "piiMasking": [
        "bsn",
        "namen_natuurlijke_personen",
        "adresgegevens_aanvrager"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III — essentiële overheidsdiensten)",
      "dora": {
        "tested": false,
        "lastPentest": null,
        "incidentStatus": "n.v.t. — kwetsbaarheidsscan gepland"
      },
      "explainability": "Ja — elke bevinding verwijst naar de planregel of het indieningsvereiste waarop de toets is gebaseerd; bias-audit loopt."
    },
    "integrity": {
      "codeHash": "2c87156552ed11ad4e932c4ad630e9de54bb7480703770913d27407a9f657923",
      "cardHash": null,
      "signedAt": null,
      "status": "in validatie",
      "checkUrl": "bn-agent-check.html?id=bna:agent:vergunning-check-048"
    }
  },
  "bna:agent:contract-review-051": {
    "riskLevel": 2,
    "functional": {
      "intent": "Reviewt commerciële contracten tegen een instelbaar clausule-playbook: afwijkingen, ontbrekende bepalingen en risicopassages.",
      "inputs": [
        "contract (PDF/DOCX)",
        "clausule-playbook van de organisatie",
        "jurisdictieprofiel"
      ],
      "outputs": [
        "reviewrapport met bevinding per clausule (JSON)",
        "gemarkeerd contract met tekstsuggesties"
      ],
      "hitlTrigger": "Bevindingen met risicoklasse 'materieel' vereisen review door een jurist voordat het rapport wordt gedeeld; de agent onderhandelt of ondertekent nooit."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "Microsoft Graph (contractopslag SharePoint, alleen-lezen)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Contracten alleen in-memory tijdens verwerking; rapporten naar de DMS van de afnemer, logs 12 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen",
        "contactgegevens"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-05",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke bevinding verwijst naar clausulenummer, playbookregel en tekstanker in het brondocument."
    },
    "integrity": {
      "codeHash": "37eeaa78cce4569da5b5be7719cfe92efcc53518487056e2deeaf7f604503a8e",
      "cardHash": "fa3cfb6025a429f380cab91ae5045d6e14a21e4baaca1a2ee9e0e1aeba78d858",
      "signedAt": "2026-05-19T15:08:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:contract-review-051"
    }
  },
  "bna:agent:claim-intake-054": {
    "riskLevel": 3,
    "functional": {
      "intent": "Neemt schadeclaims gestructureerd in: dekkingscheck, documentclassificatie en fraude-indicatoren.",
      "inputs": [
        "schademelding (formulier/e-mail/foto's)",
        "polisvoorwaarden en dekkingsgegevens",
        "fraude-indicatorenprofiel"
      ],
      "outputs": [
        "gestructureerd claimdossier (JSON)",
        "dekkingsadvies en fraudesignaal met onderbouwing"
      ],
      "hitlTrigger": "Elke afwijzing, elk fraudesignaal en elke claim boven de mandaatgrens gaat verplicht langs de schadebehandelaar; de agent keert nooit zelfstandig uit (AVG art. 22)."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "BYOC: draait binnen de AWS-omgeving van de verzekeraar (eu-west-1)",
      "connectors": [
        "iDIN (identiteitsverificatie melder)",
        "Salesforce (polis- en klantcontext)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (omgeving van verzekeraar)",
      "zeroDataRetention": true,
      "retention": "Schadedossier 7 jaar; logs 18 maanden",
      "piiMasking": [
        "bsn",
        "iban",
        "medische_gegevens",
        "kenteken_pseudonimisering"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-05",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — dekkingsadvies logt polisartikel en voorwaardenversie; fraudesignalen loggen de indicatorset zonder black-box-score."
    },
    "integrity": {
      "codeHash": "237e4a0f7f3185f690b9366dba960129ad136963593ca29b592afc10284728b7",
      "cardHash": "fee86fd5db6055732b151e71488a36242248ef97e1b7ee5a701ea2bc84b69195",
      "signedAt": "2026-06-02T08:55:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:claim-intake-054"
    }
  },
  "bna:agent:verzuim-signal-057": {
    "riskLevel": 5,
    "functional": {
      "intent": "Signaleert verzuimpatronen voor casemanagers (frequentie, duur, teamclusters) als gespreksvoorbereiding.",
      "inputs": [
        "verzuimregistratie (geanonimiseerde export)",
        "teamstructuur",
        "signaleringsdrempels"
      ],
      "outputs": [
        "signaleringsrapport per team (JSON)",
        "gespreksleidraad voor de casemanager"
      ],
      "hitlTrigger": "Volledige HITL vereist: signalen leiden nooit tot automatische acties richting werknemers; elk signaal is uitsluitend input voor het gesprek van de casemanager (AVG art. 22, Wet verbetering poortwachter)."
    },
    "architecture": {
      "baseModel": "Claude Sonnet 4.6 via AWS Bedrock (anthropic.claude-sonnet-4-6, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "HR-systeemkoppeling (AFAS/Visma) — in beoordeling"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Verzuimdossier 2 jaar na herstel; signaleringsrapporten 6 maanden, logs 12 maanden",
      "piiMasking": [
        "bsn",
        "naam",
        "diagnose_gegevens_categorisch_geweigerd"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "hoog_risico (Annex III — werkgerelateerde monitoring)",
      "dora": {
        "tested": false,
        "lastPentest": null,
        "incidentStatus": "n.v.t. — bias-audit en AP-consultatie lopen"
      },
      "explainability": "In beoordeling — patroononderbouwing per signaal aanwezig, bias-audit nog niet afgerond."
    },
    "integrity": {
      "codeHash": "52f9beca5cf062d11211473094a0c18293947dae0f68c026ea86ee4460c8ae63",
      "cardHash": null,
      "signedAt": null,
      "status": "niet ondertekend",
      "checkUrl": "bn-agent-check.html?id=bna:agent:verzuim-signal-057"
    }
  },
  "bna:agent:woz-taxatie-060": {
    "riskLevel": 3,
    "functional": {
      "intent": "Ondersteunt gemeentelijke taxateurs met modelmatige WOZ-waardering: referentieobjecten, marktanalyse en onderbouwing per beschikking.",
      "inputs": [
        "objectkenmerken (BAG/WOZ-administratie)",
        "markttransacties en referentieobjecten",
        "waarderingsmodelparameters"
      ],
      "outputs": [
        "modelwaarde met referentieonderbouwing (JSON)",
        "concept-taxatieverslag per object"
      ],
      "hitlTrigger": "Waarderingen met afwijking > 15% t.o.v. de vorige beschikking of met minder dan drie bruikbare referenties gaan verplicht langs de taxateur vóór vaststelling."
    },
    "architecture": {
      "baseModel": "Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5, eu-central-1) + hedonisch waarderingsmodel",
      "infrastructure": "BYOC: draait binnen de gemeentelijke Azure-omgeving (EU-West)",
      "connectors": [
        "KVK Handelsregister API (niet-woningen)",
        "marktdatakoppeling (REST)"
      ],
      "hosting": "byoc"
    },
    "guardrails": {
      "dataResidency": "EU_only (gemeentelijke tenant, Azure West-Europe)",
      "zeroDataRetention": true,
      "retention": "Taxatiedossier 7 jaar (Wet WOZ); logs 12 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen",
        "eigenaarsgegevens"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "beperkt_risico (transparantieverplichting)",
      "dora": {
        "tested": true,
        "lastPentest": "2026-02",
        "incidentStatus": "nominal"
      },
      "explainability": "Ja — elke modelwaarde logt referentieobjecten, correctiefactoren en modelversie naar de audittrail."
    },
    "integrity": {
      "codeHash": "5b4164aa7e0af8805fd269c59c7d7bdd3dd960c1cf6c519482d058a53cdf7d6d",
      "cardHash": "989f6c35a3318dc808e16549e1f83fe7f6aef826a3bc654a854933d1da3f2fe2",
      "signedAt": "2026-03-27T11:30:00Z",
      "status": "geldig",
      "checkUrl": "bn-agent-check.html?id=bna:agent:woz-taxatie-060"
    }
  },
  "bna:agent:huurindex-063": {
    "riskLevel": 2,
    "functional": {
      "intent": "Berekent huurindexaties volgens contractclausules en stelt indexatiebrieven op.",
      "inputs": [
        "huurcontractgegevens en indexatieclausule",
        "CBS-indexcijfers",
        "briefsjablonen"
      ],
      "outputs": [
        "indexatieberekening per contract (JSON)",
        "concept-indexatiebrief"
      ],
      "hitlTrigger": "Indexaties boven het contractuele maximum of met een negatieve uitkomst worden ter controle voorgelegd aan de portefeuillebeheerder."
    },
    "architecture": {
      "baseModel": "Claude Haiku 4.5 via AWS Bedrock (anthropic.claude-haiku-4-5, eu-central-1)",
      "infrastructure": "Geïsoleerde tenant-container (Kubernetes) in AWS eu-central-1",
      "connectors": [
        "boekhoudkoppeling (Exact Online)",
        "CBS StatLine (indexcijfers)"
      ],
      "hosting": "hosted"
    },
    "guardrails": {
      "dataResidency": "EU_only (eu-central-1, Frankfurt)",
      "zeroDataRetention": true,
      "retention": "Huurdossier 7 jaar; logs 12 maanden",
      "piiMasking": [
        "namen_natuurlijke_personen",
        "iban"
      ]
    },
    "complianceCheck": {
      "euAiActClass": "minimaal_risico",
      "dora": {
        "tested": true,
        "lastPentest": "2026-01",
        "incidentStatus": "degraded — hash-afwijking gedetecteerd, agent bevroren"
      },
      "explainability": "Ja — elke berekening logt indexcijfer, clausule en formule; de bevriezing zelf staat als incident in de audittrail."
    },
    "integrity": {
      "codeHash": "07f14e205305265a9c8ba0f45636eb616461b51cb3d9ff92df8183f03253798d",
      "cardHash": "b771aff0aee92d82c45a819ff707e9982ce3f684c1358855bae10206979aeb71",
      "signedAt": "2026-02-18T10:12:00Z",
      "status": "gebroken",
      "checkUrl": "bn-agent-check.html?id=bna:agent:huurindex-063"
    }
  }
};

window.BN_RISK_LEVEL_LABELS = {
  1: "Alleen interne dataconsumptie",
  2: "Documentverwerking, geen externe acties",
  3: "Externe koppelingen, geaggregeerde data",
  4: "Persoonsgegevens / financiële beslissingen",
  5: "Hoog risico: BSN/UBO, KYC of externe transacties"
};

// Merge de v1.1-uitbreiding in de basisdataset zodat elke consument
// (registry, detailpagina, JSON-export) één volledig kaartobject ziet.
window.BN_AGENTS.forEach(function (a) {
  var ext = window.BN_CARD_EXTENSIONS[a.agentId];
  if (ext) Object.assign(a, ext);
});

