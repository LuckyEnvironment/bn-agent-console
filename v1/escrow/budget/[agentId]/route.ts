import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPrivate } from "@/lib/api";
import { resolveCaller, requireScope } from "@/server/auth";
import { BudgetError, getBudgetStatus } from "@/server/budget";

/**
 * GET /v1/escrow/budget/{agentId} — realtime mandaat en saldo.
 *
 * Toont het dynamisch mandaat (Boek VIII Titel 11): de per-transactielimiet,
 * de uurcapaciteit (token bucket, continu hervuld), de datadimensie en α
 * (afgeleid van de Vertrouwensscore, Art. 8.31 lid 3), plus het actuele
 * restsaldo. Afnemers zien vóór en tijdens inhuur precies hoeveel autonomie
 * de agent op dit moment heeft; auditors zien waarop is gehandhaafd.
 * Geauthenticeerd: saldi zijn operationele gegevens van de afnemer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> },
) {
  try {
    const caller = await resolveCaller(request.headers.get("authorization"));
    if (caller.tier === "public") {
      return apiError(401, "Authenticatie vereist (OAuth 2.1 client credentials, zie /v1/oauth/token)");
    }
    if (!requireScope(caller, "escrow:read")) {
      return apiError(403, "Scope escrow:read vereist");
    }

    const { agentId } = await params;
    const result = await getBudgetStatus(agentId);
    return jsonPrivate(result);
  } catch (e) {
    if (e instanceof BudgetError) {
      return apiError(e.status, e.message, { articles: e.articles });
    }
    return handleUnknown(e);
  }
}
