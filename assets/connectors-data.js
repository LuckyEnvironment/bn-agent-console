// BN Agent — gedeelde connectordataset (Connector Standaard v1.0, onderdeel van platform v2).
// Single source of truth voor de connectorcatalogus (bn-agent-connectors.html),
// het connectorpaneel op de agent-detailpagina en de console-demo.
// Elke entry conformeert aan schemas/connector.schema.json.
//
// riskContribution (0-100) is de koppelingsbijdrage van de connector: hij voedt de
// links-factor van de Boek VIII-risicoscore van elke agent die de connector gebruikt.
// Invariant (zie assets/agents-data.js): agent.riskBreakdown.links >=
// max(riskContribution) van de gekoppelde connectors.
window.BN_CONNECTORS = [
  {
    "connectorId": "bnc:connector:kvk-handelsregister",
    "name": "KVK Handelsregister API",
    "provider": "Kamer van Koophandel",
    "category": "Registers",
    "version": "1.4.0",
    "description": "Zoeken en basisprofielen uit het Handelsregister: inschrijvingen, vestigingen en functionarissen. Alleen-lezen.",
    "authType": "apiKey",
    "scopes": ["hr.search", "hr.basisprofiel"],
    "dataCategories": ["bedrijfsgegevens"],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 35,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:bkr-toetsing",
    "name": "BKR-toetsing",
    "provider": "Stichting BKR",
    "category": "Krediet & identiteit",
    "version": "2.1.0",
    "description": "Kredietregistratietoetsing voor vergunninghoudende kredietverstrekkers. Elke toets wordt gelogd en is zichtbaar voor de betrokkene.",
    "authType": "mtls",
    "scopes": ["toetsing.uitvoeren"],
    "dataCategories": ["kredietregistratie", "persoonsgegevens"],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 60,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:idin",
    "name": "iDIN",
    "provider": "Currence / Nederlandse banken",
    "category": "Krediet & identiteit",
    "version": "1.2.0",
    "description": "Identiteitsverificatie via de bankomgeving van de gebruiker: naam-, leeftijds- en adresattributen met expliciete toestemming per attribuutset.",
    "authType": "oauth2",
    "scopes": ["identify", "attributes.name", "attributes.address"],
    "dataCategories": ["identiteit", "persoonsgegevens"],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 50,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ideal",
    "name": "iDEAL 2.0 betaalinitiatie",
    "provider": "Currence",
    "category": "Betalen",
    "version": "0.9.0",
    "description": "Betaalverzoeken en statusnotificaties. In validatie: agents mogen betalingen voorbereiden, initiatie vereist de HITL-gate van de afnemer.",
    "authType": "oauth2",
    "scopes": ["payment.create", "payment.status"],
    "dataCategories": ["betaalgegevens", "persoonsgegevens"],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 65,
    "status": "in validatie",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:digid",
    "name": "DigiD",
    "provider": "Logius",
    "category": "Krediet & identiteit",
    "version": "3.0.0",
    "description": "Authenticatie van burgers voor (semi-)publieke dienstverlening. BSN komt de agentomgeving nooit ongemaskeerd binnen; alleen het betrouwbaarheidsniveau en een pseudoniem worden doorgegeven.",
    "authType": "mtls",
    "scopes": ["authenticate.basis", "authenticate.midden", "authenticate.substantieel"],
    "dataCategories": ["bsn", "identiteit"],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 60,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:eherkenning",
    "name": "eHerkenning",
    "provider": "Afsprakenstelsel eHerkenning",
    "category": "Krediet & identiteit",
    "version": "1.13.0",
    "description": "Authenticatie en machtigingen voor zakelijke gebruikers richting overheidsdiensten, inclusief betrouwbaarheidsniveau EH3/EH4.",
    "authType": "mtls",
    "scopes": ["authenticate", "machtiging.check"],
    "dataCategories": ["identiteit", "bedrijfsgegevens"],
    "dataResidency": "NL_only",
    "zeroDataRetention": true,
    "riskContribution": 55,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ms-graph",
    "name": "Microsoft Graph",
    "provider": "Microsoft",
    "category": "Productiviteit & CRM",
    "version": "1.0.0",
    "description": "Documentontsluiting uit Microsoft 365 (SharePoint/OneDrive/Exchange) binnen de tenant van de afnemer. Standaard alleen-lezen; schrijfscopes vereisen aparte certificering.",
    "authType": "oauth2",
    "scopes": ["Files.Read.All", "Sites.Read.All"],
    "dataCategories": ["documenten", "e-mail", "agenda"],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 45,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:salesforce",
    "name": "Salesforce REST API",
    "provider": "Salesforce",
    "category": "Productiviteit & CRM",
    "version": "2.0.0",
    "description": "Klant- en poliscontext uit de CRM-omgeving van de afnemer (EU-instance). Veldniveau-autorisatie volgt het Salesforce-profiel van de gekoppelde integratiegebruiker.",
    "authType": "oauth2",
    "scopes": ["api", "refresh_token"],
    "dataCategories": ["crm", "klantgegevens"],
    "dataResidency": "EU_only",
    "zeroDataRetention": false,
    "riskContribution": 50,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:exact-online",
    "name": "Exact Online",
    "provider": "Exact",
    "category": "Boekhouding",
    "version": "1.7.0",
    "description": "Boekhoudkoppeling: openstaande posten en factuurstatus lezen, notities schrijven. Geen betaal- of boekingsmutaties via deze connector.",
    "authType": "oauth2",
    "scopes": ["financial.read", "notes.write"],
    "dataCategories": ["boekhouding", "facturen"],
    "dataResidency": "EU_only",
    "zeroDataRetention": true,
    "riskContribution": 20,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:ocpi-laadinfra",
    "name": "OCPI-laadinfrastructuur",
    "provider": "Open Charge Alliance-partijen",
    "category": "Mobiliteit & IoT",
    "version": "2.2.1",
    "description": "Laadsessies en laadpuntstatus via het OCPI-protocol. Locatiedata wordt geaggregeerd vóór levering aan agents.",
    "authType": "apiKey",
    "scopes": ["sessions.read", "locations.read"],
    "dataCategories": ["telemetrie", "locatie_geaggregeerd"],
    "dataResidency": "EER",
    "zeroDataRetention": true,
    "riskContribution": 30,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  },
  {
    "connectorId": "bnc:connector:generic-rest",
    "name": "Generieke REST/webhook-connector",
    "provider": "BN Agent",
    "category": "Generiek",
    "version": "1.0.0",
    "description": "Configureerbare REST- en webhookkoppeling voor bronnen zonder eigen gecertificeerde connector. Endpoint-allowlist, schemavalidatie en response-hashing per aanroep zijn verplicht.",
    "authType": "apiKey",
    "scopes": ["endpoint.call", "webhook.receive"],
    "dataCategories": ["configureerbaar"],
    "dataResidency": "EER",
    "zeroDataRetention": true,
    "riskContribution": 40,
    "status": "actief",
    "docsUrl": "bn-agent-docs.html#connectors"
  }
];

window.BN_CONNECTOR_STATUS_LABELS = {
  "actief": "Actief — gecertificeerd en inzetbaar",
  "in validatie": "In validatie — nog niet vrijgegeven",
  "gedeprecieerd": "Gedeprecieerd — uitfasering loopt"
};

window.BN_CONNECTOR_AUTH_LABELS = {
  "oauth2": "OAuth 2.1",
  "apiKey": "API-sleutel",
  "mtls": "mTLS-certificaat"
};

window.bnConnectorById = function (id) {
  return window.BN_CONNECTORS.find(function (c) { return c.connectorId === id; }) || null;
};

// Agents die een connector gebruiken (afgeleid uit agents-data.js, indien geladen).
window.bnAgentsForConnector = function (id) {
  if (!window.BN_AGENTS) return [];
  return window.BN_AGENTS.filter(function (a) {
    return (a.connectorIds || []).indexOf(id) !== -1;
  });
};
