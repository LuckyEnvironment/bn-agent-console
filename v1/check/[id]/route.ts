import type { NextRequest } from "next/server";
import { apiError, handleUnknown, jsonPublic } from "@/lib/api";
import { checkAgentCertificate } from "@/server/registry";

/**
 * GET /v1/check/{id} — publieke certificaatcheck ("Powered by BN Agent").
 * Dit endpoint voedt be-an-agent.nl/check/{id}: het watermerk onder
 * documenten die via een BN-compliant agent zijn geproduceerd verwijst
 * hierheen. Geen authenticatie: iedere ontvanger van een document moet
 * het certificaat kunnen controleren.
 *
 * Antwoord: certificeringsstatus, integriteit (code_hash/card_hash geldig,
 * in validatie of gebroken/bevroren), risiconiveau + tier, en het aantal
 * audittrail-entries. Met ?tx={transaction_id} wordt ook gecontroleerd of
 * de transactie in het WORM-logboek van deze agent staat.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tx = request.nextUrl.searchParams.get("tx") ?? undefined;
    const result = await checkAgentCertificate(id, tx);
    if (!result) return apiError(404, "Agent niet gevonden in de Discovery Registry");
    // korte cache: bevriezing na hash-breuk moet snel zichtbaar zijn
    return jsonPublic(result, { cacheSeconds: 30 });
  } catch (e) {
    return handleUnknown(e);
  }
}
