import {
  retainCustomerMessage,
  recallCustomerMemories,
  isHindsightConfigured,
} from "../lib/hindsight";
import {
  getCustomerMemories,
  mapHindsightToMemoryItem,
  normalizeCustomer,
} from "../services/support-agent";

export async function handleMemoryRoute(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const method = request.method;

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // GET /api/memory?customerId=... or ?customerName=...
  if (pathname === "/api/memory" && method === "GET") {
    try {
      const paramCustomerId = url.searchParams.get("customerId");
      const paramCustomerName = url.searchParams.get("customerName");

      const { customerId } = normalizeCustomer(
        paramCustomerId || undefined,
        paramCustomerName || undefined,
      );

      const memories = await getCustomerMemories(customerId);

      return new Response(JSON.stringify({ memories }), {
        status: 200,
        headers,
      });
    } catch (err: unknown) {
      console.error("[MemoryRoute] GET error:", err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ error: message, memories: [] }), {
        status: 500,
        headers,
      });
    }
  }

  // POST /api/memory/retain
  if (pathname === "/api/memory/retain" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { customerId, content, conversationId } = body;

      if (!customerId || !content || typeof content !== "string") {
        return new Response(
          JSON.stringify({
            success: false,
            error: "customerId and content (string) are required.",
          }),
          { status: 400, headers },
        );
      }

      const norm = normalizeCustomer(customerId);

      if (isHindsightConfigured()) {
        await retainCustomerMessage(norm.customerId, norm.customerName, content, conversationId);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers,
      });
    } catch (err: unknown) {
      console.error("[MemoryRoute] POST /retain error:", err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ success: false, error: message }), {
        status: 500,
        headers,
      });
    }
  }

  // POST /api/memory/recall
  if (pathname === "/api/memory/recall" && method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { customerId, query } = body;

      if (!customerId || !query || typeof query !== "string") {
        return new Response(
          JSON.stringify({
            error: "customerId and query (string) are required.",
            memories: [],
          }),
          { status: 400, headers },
        );
      }

      const norm = normalizeCustomer(customerId);

      if (isHindsightConfigured()) {
        const recalled = await recallCustomerMemories(norm.customerId, norm.customerName, query);
        const mapped = recalled.map((m, idx) => mapHindsightToMemoryItem(m, idx));
        return new Response(JSON.stringify({ memories: mapped }), {
          status: 200,
          headers,
        });
      }

      // Fallback
      const fallbackMemories = await getCustomerMemories(norm.customerId);
      return new Response(JSON.stringify({ memories: fallbackMemories }), {
        status: 200,
        headers,
      });
    } catch (err: unknown) {
      console.error("[MemoryRoute] POST /recall error:", err);
      const message = err instanceof Error ? err.message : "Internal Server Error";
      return new Response(JSON.stringify({ error: message, memories: [] }), {
        status: 500,
        headers,
      });
    }
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), {
    status: 404,
    headers,
  });
}
