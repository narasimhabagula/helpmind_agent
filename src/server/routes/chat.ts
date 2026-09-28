import { executeSupportAgentWorkflow, type ChatRequestPayload } from "../services/support-agent";

export async function handleChatRoute(request: Request): Promise<Response> {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ChatRequestPayload>;

    const message = body.message;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Message is required and must be a non-empty string.",
        }),
        { status: 400, headers },
      );
    }

    const payload: ChatRequestPayload = {
      message: message.trim(),
    };
    if (body.customerId) payload.customerId = body.customerId;
    if (body.customerName) payload.customerName = body.customerName;
    if (body.conversationId) payload.conversationId = body.conversationId;

    const result = await executeSupportAgentWorkflow(payload);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    console.error("[ChatRoute] Error handling chat message:", err);
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      { status: 500, headers },
    );
  }
}
