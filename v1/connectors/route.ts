import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate, jsonPublic } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { ConnectorError, registerConnector, searchConnectors } from "@/server/connectors";

/**
 * GET /v1/connectors — zoeken/filteren in de connectorcatalogus.
 * Publiek leesbaar, net als de registry-zoekfunctie: afnemers moeten vóór
 * inhuur kunnen beoordelen welke koppelingen een agent gebruikt.
 */
export async function GET(request: NextRequest) {
  try {
    const p = request.nextUrl.searchParams;
    const limit = p.get("limit") ? Number(p.get("limit")) : undefined;
    if (limit !== undefined && (!Number.isInteger(limit) || limit < 1 || limit > 100)) {
      return apiError(400, "limit moet een geheel getal tussen 1 en 100 zijn");
    }
    const offset = p.get("offset") ? Number(p.get("offset")) : undefined;
    if (offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
      return apiError(400, "offset moet een geheel getal >= 0 zijn");
    }
    const result = await searchConnectors({
      q: p.get("q") ?? undefined,
      auth_type: (p.get("auth_type") as "oauth2" | "apiKey" | "mtls") ?? undefined,
      category: p.get("category") ?? undefined,
      data_residency: (p.get("data_residency") as "EU_only" | "NL_only" | "EER") ?? undefined,
      status: (p.get("status") as "actief" | "in validatie" | "gedeprecieerd") ?? undefined,
      limit,
      offset,
    });
    return jsonPublic(result, { cacheSeconds: 300 });
  } catch (e) {
    return handleUnknown(e);
  }
}

/**
 * POST /v1/connectors — connector-manifest indienen/updaten.
 * Het manifest (schemas/connector.schema.json) bevat uitsluitend metadata.
 * Veiligheidsklep: credentials/secrets in de payload worden categorisch
 * geweigerd zolang CONNECTOR_LIVE_CREDENTIALS uit staat — geheimen leven
 * in de kluis van de hostingomgeving, nooit in het register.
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist (OAuth 2.1 client credentials, zie /v1/oauth/token)");
    }
    if (!requireScope(caller, "connectors:write")) {
      return apiError(403, "Scope connectors:write vereist");
    }
    const body = (await request.json()) as Record<string, unknown>;
    if (body.credentials !== undefined || body.secrets !== undefined || body.apiKey !== undefined) {
      return apiError(
        422,
        "Credentials worden niet aangenomen: live credential-beheer is uitgeschakeld (CONNECTOR_LIVE_CREDENTIALS=false). Dien uitsluitend het connector-manifest in; geheimen horen in de kluis van de hostingomgeving.",
      );
    }
    const result = await registerConnector(body, caller);
    return jsonPrivate(result, 201);
  } catch (e) {
    if (e instanceof ConnectorError) {
      return apiError(e.status, e.message, e.details);
    }
    return handleUnknown(e);
  }
}
