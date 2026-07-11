import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { ConnectorError, verifyConnectorInvocation, invokeConnector } from "@/server/connectors";

/**
 * POST /v1/connectors/{id}/invoke — connector-aanroep via de proxy.
 * Runtime-handhaving van de koppelingslaag; de controlevolgorde is bindend:
 *
 *   1. kaart geldig    — integrity.status van de aanroepende agent is "geldig"
 *                        (niet ondertekend/gebroken/geschorst ⇒ 403);
 *   2. status actief   — de connector staat op "actief" in de catalogus
 *                        (in validatie/gedeprecieerd ⇒ 409);
 *   3. pin-match       — de op de Agent Card gepinde (version, manifestHash)
 *                        is gelijk aan de actuele catalogus; een gebroken pin
 *                        betekent hervalidatie en dus weigering (409);
 *   4. scope-subset    — requested_scopes ⊆ manifest.scopes (422).
 *
 * Pas daarna wordt de aanroep doorgezet. Elke doorgezette aanroep landt als
 * input_source in de WORM-audittrail van de agent met connector_id én
 * connector_manifest_hash (de hash die de proxy in stap 3 verifieerde), zodat
 * onweerlegbaar vastligt welke manifestversie van kracht was.
 *
 * Veiligheidsklep: daadwerkelijke doorzetting staat achter de feature flag
 * CONNECTOR_LIVE_INVOCATION (default uit). Zonder flag worden stap 1–4 wél
 * uitgevoerd en wordt het verificatieresultaat teruggegeven met 503, zodat
 * integraties de handhaving kunnen testen zonder dat er data stroomt.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^bnc:connector:[a-z0-9-]+$/.test(id)) {
      return apiError(400, "Ongeldige connector-id: verwacht formaat bnc:connector:{slug}");
    }

    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist (OAuth 2.1 client credentials, zie /v1/oauth/token)");
    }
    if (!requireScope(caller, "connectors:invoke")) {
      return apiError(403, "Scope connectors:invoke vereist");
    }

    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.agent_id !== "string" || !/^bna:agent:[a-z0-9-]+$/.test(body.agent_id)) {
      return apiError(400, "agent_id (formaat bna:agent:{slug}) is verplicht: aanroepen lopen altijd namens een geregistreerde agent");
    }
    if (body.credentials !== undefined || body.secrets !== undefined || body.apiKey !== undefined) {
      return apiError(
        422,
        "Credentials horen niet in de aanroep: de proxy gebruikt de kluis van de hostingomgeving (zie CONNECTOR_LIVE_CREDENTIALS).",
      );
    }

    // Stap 1–4: kaart geldig → connector actief → pin-match → scope-subset.
    // Gooit ConnectorError met de juiste status (403/404/409/422) bij elke schending.
    const verification = await verifyConnectorInvocation(id, body.agent_id, {
      requestedScopes: Array.isArray(body.requested_scopes) ? (body.requested_scopes as string[]) : undefined,
      caller,
    });

    if (process.env.CONNECTOR_LIVE_INVOCATION !== "true") {
      return apiError(
        503,
        "Live connector-aanroepen zijn uitgeschakeld (CONNECTOR_LIVE_INVOCATION=false). De handhavingscontroles zijn wél uitgevoerd; zie verification.",
        { verification },
      );
    }

    // Doorzetten + audittrail: invokeConnector schrijft de input_source
    // (connector_id + connector_manifest_hash + response_hash) naar de WORM-trail.
    const result = await invokeConnector(id, body, verification, caller);
    return jsonPrivate(result, 200);
  } catch (e) {
    if (e instanceof ConnectorError) {
      return apiError(e.status, e.message, e.details);
    }
    return handleUnknown(e);
  }
}
