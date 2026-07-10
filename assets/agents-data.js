// BN Agent — shared sample-agent dataset (Agent Card Standaard v1.1, public preview subset).
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

