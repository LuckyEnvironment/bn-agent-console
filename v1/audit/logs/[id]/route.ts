import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { getAuditEntry } from "@/server/audit";

/**
 * GET /v1/audit/logs/{transaction_id} — één volledige log-entry inclusief
 * ketenbewijs. Het antwoord bevat naast de entry zelf een chainProof
 * (entry_hash, prev_entry_hash en de herberekening) zodat een externe
 * auditor de onwijzigbaarheid onafhankelijk kan vaststellen.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist");
    }
    if (!requireScope(caller, "audit:read")) {
      return apiError(403, "Scope audit:read vereist");
    }

    const result = await getAuditEntry(id, caller);
    if (!result) return apiError(404, "Transactie niet gevonden");
    return jsonPrivate(result);
  } catch (e) {
    return handleUnknown(e);
  }
}
