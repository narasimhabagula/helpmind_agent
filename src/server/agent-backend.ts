// Server-side Support Agent, Hindsight Memory Architecture, and API Handler
import { handleChatRoute } from "./routes/chat";
import { handleMemoryRoute } from "./routes/memory";
import { handleHealthRoute } from "./routes/health";
import {
  getCustomerMemories,
  getCustomerList,
  getCustomerConversations,
  normalizeCustomer,
} from "./services/support-agent";

// ==========================================
// SESSION STATE MANAGEMENT
// ==========================================
interface ActiveSession {
  id: string;
  customerId: string;
  customerName: string;
  createdAt: number;
}

const activeSessions = new Map<string, ActiveSession>();

export function getOrCreateSession(
  sessionId: string,
  customerName: string,
  customerId?: string,
): ActiveSession {
  let session = activeSessions.get(sessionId);
  if (!session) {
    const norm = normalizeCustomer(customerId, customerName);
    session = {
      id: sessionId,
      customerId: norm.customerId,
      customerName: norm.customerName,
      createdAt: Date.now(),
    };
    activeSessions.set(sessionId, session);
  }
  return session;
}

export function resetSession(sessionId: string) {
  activeSessions.delete(sessionId);
}

// ==========================================
// HTTP API ROUTE DISPATCHER
// ==========================================
export async function handleApiRequest(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // CORS headers
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  // 1. Health Check: GET /api/health
  if (pathname === "/api/health" && request.method === "GET") {
    return await handleHealthRoute(request);
  }

  // 2. Chat Agent Workflow: POST /api/chat
  if (pathname === "/api/chat" && request.method === "POST") {
    return await handleChatRoute(request);
  }

  // 3. Memory APIs: GET /api/memory, POST /api/memory/retain, POST /api/memory/recall
  if (pathname.startsWith("/api/memory")) {
    return await handleMemoryRoute(request);
  }

  // 4. Customers Directory: GET /api/customers
  if (pathname === "/api/customers" && request.method === "GET") {
    const customers = getCustomerList();
    return new Response(JSON.stringify({ customers }), { status: 200, headers });
  }

  // 5. Conversation History: GET /api/conversations?customerId=...
  if (pathname === "/api/conversations" && request.method === "GET") {
    const customerId = url.searchParams.get("customerId") || "CUST-1024";
    const conversations = getCustomerConversations(customerId);
    return new Response(JSON.stringify({ conversations }), { status: 200, headers });
  }

  // 6. Session info: GET /api/session
  if (pathname === "/api/session" && request.method === "GET") {
    const name = url.searchParams.get("name") || "Customer";
    const reqCustId = url.searchParams.get("customerId") || undefined;
    const sessionId =
      url.searchParams.get("sessionId") ||
      `sess_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const session = getOrCreateSession(sessionId, name, reqCustId);
    const memories = await getCustomerMemories(session.customerId);

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        customerId: session.customerId,
        customerName: session.customerName,
        memories,
      }),
      { status: 200, headers },
    );
  }

  // 7. Reset session: POST /api/reset
  if (pathname === "/api/reset" && request.method === "POST") {
    try {
      const body = await request.json().catch(() => ({}));
      const { sessionId } = body;
      if (sessionId) {
        resetSession(sessionId);
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    } catch {
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
    }
  }

  return new Response(JSON.stringify({ error: `Endpoint ${pathname} not found` }), {
    status: 404,
    headers,
  });
}
