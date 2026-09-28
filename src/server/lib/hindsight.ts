import "./env.ts";
import { HindsightClient } from "@vectorize-io/hindsight-client";

// Environment variables
const HINDSIGHT_BASE_URL =
  process.env["HINDSIGHT_BASE_URL"] || "https://api.hindsight.vectorize.io";
const HINDSIGHT_API_KEY = process.env["HINDSIGHT_API_KEY"] || "";
export const HINDSIGHT_BANK_ID = process.env["HINDSIGHT_BANK_ID"] || "helpmind";

export type HindsightMemory = {
  id: string;
  text: string;
  type: "world" | "experience" | "observation";
  date?: string | undefined;
  source?: string | undefined;
  customerId?: string | undefined;
};

let clientInstance: HindsightClient | null = null;
let bankInitialized = false;
const seededCustomers = new Set<string>();

export function isHindsightConfigured(): boolean {
  return Boolean(HINDSIGHT_API_KEY && HINDSIGHT_API_KEY.trim().length > 0);
}

export function getHindsightClient(): HindsightClient | null {
  if (!isHindsightConfigured()) {
    return null;
  }
  if (!clientInstance) {
    clientInstance = new HindsightClient({
      baseUrl: HINDSIGHT_BASE_URL,
      apiKey: HINDSIGHT_API_KEY,
    });
  }
  return clientInstance;
}

/**
 * Ensures the memory bank exists in Hindsight.
 */
export async function ensureMemoryBank(): Promise<boolean> {
  const client = getHindsightClient();
  if (!client || bankInitialized) return Boolean(client);

  try {
    // Attempt to verify bank config; create if not found
    try {
      await client.getBankConfig(HINDSIGHT_BANK_ID);
      bankInitialized = true;
      return true;
    } catch (profileErr: unknown) {
      const isNotFound =
        (typeof profileErr === "object" &&
          profileErr !== null &&
          "status" in profileErr &&
          (profileErr as { status: unknown }).status === 404) ||
        (profileErr instanceof Error && profileErr.message.includes("not found"));

      if (isNotFound) {
        console.log(`[Hindsight] Creating memory bank: ${HINDSIGHT_BANK_ID}`);
        await client.createBank(HINDSIGHT_BANK_ID, {
          name: "HelpMind AI Memory Bank",
        });
        bankInitialized = true;
        return true;
      }
      throw profileErr;
    }
  } catch (err) {
    console.warn("[Hindsight] Error initializing bank:", err);
    return false;
  }
}

/**
 * Safe one-time seed for demo customers if bank is empty
 */
export async function seedDemoCustomerIfEmpty(customerId: string): Promise<void> {
  if (seededCustomers.has(customerId)) return;
  const client = getHindsightClient();
  if (!client) return;

  try {
    await ensureMemoryBank();

    const existing = await client.recall(HINDSIGHT_BANK_ID, `[CUSTOMER_ID: ${customerId}]`, {
      tags: [customerId],
      tagsMatch: "any_strict",
    });

    if (!existing.results || existing.results.length === 0) {
      console.log(`[Hindsight] Seeding initial memories for customer ${customerId}`);

      if (customerId === "CUST-1024") {
        const initialMemories = [
          "[CUSTOMER_ID: CUST-1024] Priya Sharma is based in Hyderabad.",
          "[CUSTOMER_ID: CUST-1024] Priya Sharma previously experienced a delayed order #456.",
          "[CUSTOMER_ID: CUST-1024] Priya Sharma prefers receiving order status updates via email.",
          "[CUSTOMER_ID: CUST-1024] Priya Sharma previously contacted customer support about an order that had not arrived.",
        ];

        for (const text of initialMemories) {
          await client.retain(HINDSIGHT_BANK_ID, text, {
            tags: [customerId],
            context: "Initial customer support profile onboarding",
            metadata: { customerId, customerName: "Priya Sharma" },
          });
        }
      } else if (customerId === "CUST-2048") {
        const initialMemories = [
          "[CUSTOMER_ID: CUST-2048] Rahul Sharma is based in Vijayawada.",
          "[CUSTOMER_ID: CUST-2048] Rahul Sharma prefers phone communication.",
        ];

        for (const text of initialMemories) {
          await client.retain(HINDSIGHT_BANK_ID, text, {
            tags: [customerId],
            context: "Initial customer support profile onboarding",
            metadata: { customerId, customerName: "Rahul Sharma" },
          });
        }
      }
    }
    seededCustomers.add(customerId);
  } catch (err) {
    console.warn(`[Hindsight] Demo seed for ${customerId} skipped or failed:`, err);
  }
}

/**
 * STEP 3: Retain new customer message in Hindsight
 */
export async function retainCustomerMessage(
  customerId: string,
  customerName: string,
  message: string,
  conversationId?: string,
): Promise<void> {
  const client = getHindsightClient();
  if (!client) return;

  try {
    await ensureMemoryBank();
    const content = `[CUSTOMER_ID: ${customerId}] Customer ${customerName} said: ${message}`;
    await client.retain(HINDSIGHT_BANK_ID, content, {
      tags: [customerId],
      context: conversationId ? `Conversation ID: ${conversationId}` : "Support chat inquiry",
      metadata: {
        customerId,
        customerName,
        role: "customer",
      },
    });
  } catch (err) {
    console.warn("[Hindsight] retainCustomerMessage error:", err);
  }
}

/**
 * STEP 4 & 5: Recall customer memories strictly scoped to customerId
 */
export async function recallCustomerMemories(
  customerId: string,
  customerName: string,
  currentIssue: string,
): Promise<HindsightMemory[]> {
  const client = getHindsightClient();
  if (!client) return [];

  try {
    // Query with customer name and issue, falling back to customer name
    let recallResp = await client.recall(HINDSIGHT_BANK_ID, `${customerName} ${currentIssue}`, {
      tags: [customerId],
      tagsMatch: "any_strict",
    });

    if (!recallResp.results || recallResp.results.length === 0) {
      recallResp = await client.recall(HINDSIGHT_BANK_ID, customerName, {
        tags: [customerId],
        tagsMatch: "any_strict",
      });
    }

    if (!recallResp.results || recallResp.results.length === 0) {
      return [];
    }

    // Step 5: Filter retrieved memories to guarantee customer isolation
    const isolatedResults = recallResp.results.filter((r) => {
      if (r.tags && r.tags.includes(customerId)) return true;
      if (r.text.includes(customerId)) return true;
      if (r.text.toLowerCase().includes(customerName.toLowerCase())) return true;
      return false;
    });

    return isolatedResults.map((r, idx) => {
      let type: "world" | "experience" | "observation" = "experience";
      const rawType = (r.type || "").toLowerCase();
      if (rawType.includes("world")) type = "world";
      else if (rawType.includes("observation")) type = "observation";

      return {
        id: r.id || `mem-${idx}`,
        text: r.text.replace(`[CUSTOMER_ID: ${customerId}] `, "").trim(),
        type,
        date: r.mentioned_at ? new Date(r.mentioned_at).toLocaleDateString() : undefined,
        source: r.context || "Hindsight Memory",
        customerId,
      };
    });
  } catch (err) {
    console.warn("[Hindsight] recallCustomerMemories error:", err);
    return [];
  }
}

/**
 * STEP 9: Retain completed interaction in Hindsight
 */
export async function retainCompletedInteraction(
  customerId: string,
  customerName: string,
  userMessage: string,
  aiResponse: string,
  conversationId?: string,
): Promise<void> {
  const client = getHindsightClient();
  if (!client) return;

  try {
    const summary = `[CUSTOMER_ID: ${customerId}] Customer ${customerName} contacted HelpMind about: "${userMessage}". Support resolution: "${aiResponse.slice(0, 180)}..."`;

    await client.retain(HINDSIGHT_BANK_ID, summary, {
      tags: [customerId],
      context: conversationId
        ? `Resolved Conversation: ${conversationId}`
        : "Resolved support interaction",
      metadata: {
        customerId,
        customerName,
        role: "agent_interaction",
      },
    });

    // Synthesize structured observation/experience if order delay was reported
    const orderMatch = userMessage.match(/#?(\d{3,8})/);
    const isDelayed =
      userMessage.toLowerCase().includes("delayed") ||
      userMessage.toLowerCase().includes("not arrived") ||
      userMessage.toLowerCase().includes("late");

    if (orderMatch && isDelayed) {
      const orderNum = orderMatch[1];
      const specificFact = `[CUSTOMER_ID: ${customerId}] ${customerName} previously experienced a delayed order #${orderNum}.`;
      await client.retain(HINDSIGHT_BANK_ID, specificFact, {
        tags: [customerId],
        context: "Previous support interaction",
        metadata: {
          customerId,
          customerName,
          role: "experience",
        },
      });
    }
  } catch (err) {
    console.warn("[Hindsight] retainCompletedInteraction error:", err);
  }
}

/**
 * List all memories for a given customer
 */
export async function listCustomerMemories(customerId: string): Promise<HindsightMemory[]> {
  const client = getHindsightClient();
  if (!client) return [];

  try {
    const query = customerId === "CUST-2048" ? "Rahul Sharma" : "Priya Sharma";
    const result = await client.recall(HINDSIGHT_BANK_ID, query, {
      tags: [customerId],
      tagsMatch: "any_strict",
    });

    if (!result.results) return [];

    const isolated = result.results.filter((r) => {
      if (r.tags && r.tags.includes(customerId)) return true;
      if (r.text.includes(customerId)) return true;
      return false;
    });

    return isolated.map((r, idx) => {
      let type: "world" | "experience" | "observation" = "experience";
      const rawType = (r.type || "").toLowerCase();
      if (rawType.includes("world")) type = "world";
      else if (rawType.includes("observation")) type = "observation";

      return {
        id: r.id || `mem-${idx}`,
        text: r.text.replace(`[CUSTOMER_ID: ${customerId}] `, "").trim(),
        type,
        date: r.mentioned_at ? new Date(r.mentioned_at).toLocaleDateString() : undefined,
        source: r.context || "Hindsight Memory",
        customerId,
      };
    });
  } catch (err) {
    console.warn("[Hindsight] listCustomerMemories error:", err);
    return [];
  }
}

/**
 * Health check reporting server & Hindsight connectivity without exposing secrets
 */
export async function checkHindsightHealth(): Promise<{
  configured: boolean;
  status: "connected" | "offline" | "not_configured";
}> {
  if (!isHindsightConfigured()) {
    return { configured: false, status: "not_configured" };
  }

  const client = getHindsightClient();
  if (!client) {
    return { configured: true, status: "not_configured" };
  }

  try {
    await client.getVersion();
    return { configured: true, status: "connected" };
  } catch {
    return { configured: true, status: "offline" };
  }
}
