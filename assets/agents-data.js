// BN Agent — shared sample-agent dataset (Agent Card Standard v1.0, public preview subset).
// Single source of truth for the registry preview, the demo console, the homepage
// and the agent-detail page. Scores follow Boek VIII:
//   riskFactor  = weighted sum of riskBreakdown (static, 0-100, lower is better)
//   trustScore  = dynamic performance score (0-100, higher is better)
//   hireTier    = derived A/B/C/D from both classes.
// Invariant: sum(riskBreakdown[k] * BN_RISK_MODEL.weights[k]) === riskFactor.

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
