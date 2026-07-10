import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { AuditError, ingestAuditEntry, queryAuditLogs } from "@/server/audit";

/**
 * POST /v1/audit/logs — audit-log-entry pushen naar de WORM-opslag.
 * Agents roepen dit endpoint direct bij taakafronding aan (beveiligde
 * HTTPS-stream; gRPC-variant beschikbaar op audit.bn-agent.nl:443).
 *
 * - Payload wordt gevalideerd tegen schemas/audit-log-entry.schema.json.
 * - identities.agent.code_hash moet overeenkomen met de ondertekende Agent
 *   Card; bij een mismatch wordt de entry geweigerd én de agent bevroren.
 * - De WORM-backend (AWS QLDB / Azure Immutable Blob) staat achter de
 *   feature flag AUDIT_WORM_BACKEND; zonder backend wordt 503 teruggegeven
 *   zodat een agent nooit "stil" zonder audittrail draait.
 */
export async function POST(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist (OAuth 2.1 client credentials, zie /v1/oauth/token)");
    }
    if (!requireScope(caller, "audit:write")) {
      return apiError(403, "Scope audit:write vereist");
    }

    const body = (await request.json()) as Record<string, unknown>;
    const result = await ingestAuditEntry(body, caller);
    // 201 met integrity_chain zoals vastgelegd: entry_hash + prev_entry_hash
    return jsonPrivate(result, 201);
  } catch (e) {
    if (e instanceof AuditError) {
      return apiError(e.status, e.message, e.details);
    }
    return handleUnknown(e);
  }
}

/**
 * GET /v1/audit/logs — audittrail doorzoeken (auditor-dashboard).
 * Alleen voor de eigen organisatie, tenzij de aanroeper de rol
 * compliance-auditor met organisatie-overstijgend mandaat heeft.
 *
 * Queryparameters: agent_id, transaction_id, decision (APPROVED|REJECTED|
 * OVERRIDE|AUTONOOM), from, to (ISO 8601), limit, offset.
 */
export async function GET(request: NextRequest) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist");
    }
    if (!requireScope(caller, "audit:read")) {
      return apiError(403, "Scope audit:read vereist");
    }

    const p = request.nextUrl.searchParams;
    const result = await queryAuditLogs(
      {
        agentId: p.get("agent_id") ?? undefined,
        transactionId: p.get("transaction_id") ?? undefined,
        decision: (p.get("decision") as "APPROVED" | "REJECTED" | "OVERRIDE" | "AUTONOOM") ?? undefined,
        from: p.get("from") ?? undefined,
        to: p.get("to") ?? undefined,
        limit: p.get("limit") ? Number(p.get("limit")) : undefined,
        offset: p.get("offset") ? Number(p.get("offset")) : undefined,
      },
      caller,
    );
    return jsonPrivate(result);
  } catch (e) {
    if (e instanceof AuditError) {
      return apiError(e.status, e.message, e.details);
    }
    return handleUnknown(e);
  }
}
