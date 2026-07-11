import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate, jsonPublic } from "@/lib/api";
import { resolveCaller } from "@/server/auth";
import { getConnector } from "@/server/connectors";

/**
 * GET /v1/connectors/{id} — connector-manifest + gebruikende agents.
 * Veldfiltering per aanroeper, zoals bij /v1/registry/agents/{id}:
 * publiek ziet het manifest en de risicobijdrage; geauthenticeerde
 * afnemers zien daarnaast de operationele velden (endpointallowlist,
 * certificeringsrapportage). Elke daadwerkelijke aanroep via een
 * connector landt als input_source (met connector_id) in de
 * WORM-audittrail van de aanroepende agent.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!/^bnc:connector:[a-z0-9-]+$/.test(id)) {
      return apiError(400, "Ongeldige connector-id: verwacht formaat bnc:connector:{slug}");
    }
    const caller = await resolveCaller(request.headers.get("authorization"));
    const result = await getConnector(id, caller.tier);
    if (!result) return apiError(404, "Connector niet gevonden in de catalogus");

    const body = {
      connectorId: result.connectorId,
      manifest: result.manifest,
      usedByAgents: result.usedByAgents,
      ...(caller.tier !== "public" && {
        endpointAllowlist: result.endpointAllowlist,
        certificationReport: result.certificationReport,
      }),
    };
    return caller.tier === "public" ? jsonPublic(body, { cacheSeconds: 300 }) : jsonPrivate(body);
  } catch (e) {
    return handleUnknown(e);
  }
}
