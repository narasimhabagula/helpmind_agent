import { checkHindsightHealth, HINDSIGHT_BANK_ID } from "../lib/hindsight";
import { isGeminiConfigured } from "../lib/gemini";

export async function handleHealthRoute(_request: Request): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const health = await checkHindsightHealth();
    const isGemini = isGeminiConfigured();
    const geminiStatus = isGemini ? "configured" : "not_configured";

    return new Response(
      JSON.stringify({
        status: "ok",
        geminiConfigured: isGemini,
        hindsightConfigured: health.status === "connected",
        hindsightBank: HINDSIGHT_BANK_ID,
        gemini: geminiStatus,
        hindsight: health.status,
      }),
      { status: 200, headers },
    );
  } catch (err) {
    console.warn("[HealthRoute] Check failed:", err);
    const isGemini = isGeminiConfigured();
    return new Response(
      JSON.stringify({
        status: "ok",
        geminiConfigured: isGemini,
        hindsightConfigured: false,
        hindsightBank: HINDSIGHT_BANK_ID,
        gemini: isGemini ? "configured" : "not_configured",
        hindsight: "offline",
      }),
      { status: 200, headers },
    );
  }
}
