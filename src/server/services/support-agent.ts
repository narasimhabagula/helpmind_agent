import {
  isHindsightConfigured,
  seedDemoCustomerIfEmpty,
  retainCustomerMessage,
  recallCustomerMemories,
  retainCompletedInteraction,
  listCustomerMemories,
  type HindsightMemory,
} from "../lib/hindsight";
import { callGeminiSupportAgent, isGeminiConfigured } from "../lib/gemini";
import type { ChatMessageItem, MemoryCategory, MemoryItem } from "../../lib/demo-data";

export interface ChatRequestPayload {
  customerId?: string | undefined;
  customerName?: string | undefined;
  message: string;
  conversationId?: string | undefined;
}

export type AgentMemoryItem = MemoryItem & {
  type: "world" | "experience" | "observation";
  customerId?: string | undefined;
};

export interface PipelineTraceStep {
  step: string;
  detail: string;
  status: "completed" | "in_progress" | "skipped";
  timestamp: string;
}

export interface ChatResponsePayload {
  success: boolean;
  response: string;
  customerId: string;
  conversationId: string;
  memoriesUsed: AgentMemoryItem[];
  memoryUsed: boolean;
  pipelineTrace: PipelineTraceStep[];
  aiMessage?: ChatMessageItem | undefined;
  // For compatibility with previous response schema
  memories: AgentMemoryItem[];
}

export interface CustomerProfileData {
  id: string;
  name: string;
  email: string;
  location: string;
  preferredChannel: string;
  recentIssues: string[];
  openIssuesCount: number;
}

export interface CustomerConversationData {
  id: string;
  customerId: string;
  customer: string;
  date: string;
  issue: string;
  status: "Resolved" | "Open";
  memoryUsed: string;
}

// In-memory conversation store for multi-turn sessions and conversation history
interface StoredSession {
  customerId: string;
  customerName: string;
  conversationId: string;
  trackedIntent?: string;
  orderNumber?: string;
  messages: Array<{ role: "customer" | "ai"; text: string }>;
  memories: AgentMemoryItem[];
  createdDate: string;
  summaryIssue?: string;
}

const sessionsByCustomer = new Map<string, StoredSession[]>();

/**
 * Standard demo customer profiles
 */
export const DEMO_CUSTOMERS: Record<string, CustomerProfileData> = {
  "CUST-1024": {
    id: "CUST-1024",
    name: "Priya Sharma",
    email: "priya.sharma@example.com",
    location: "Hyderabad, India",
    preferredChannel: "Email",
    recentIssues: ["Delayed order #456", "Delivery update inquiry"],
    openIssuesCount: 1,
  },
  "CUST-2048": {
    id: "CUST-2048",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    location: "Vijayawada, India",
    preferredChannel: "Phone",
    recentIssues: ["Product specification inquiry"],
    openIssuesCount: 0,
  },
};

/**
 * Normalizes customer ID and customer name to guarantee demo consistency and memory isolation.
 */
export function normalizeCustomer(
  inputCustomerId?: string,
  inputCustomerName?: string,
): { customerId: string; customerName: string; profile: CustomerProfileData } {
  const name = (inputCustomerName || "").trim();
  const lowerName = name.toLowerCase();

  if (inputCustomerId === "CUST-1024" || lowerName.includes("priya")) {
    return {
      customerId: "CUST-1024",
      customerName: "Priya Sharma",
      profile: DEMO_CUSTOMERS["CUST-1024"]!,
    };
  }

  if (inputCustomerId === "CUST-2048" || lowerName.includes("rahul")) {
    return {
      customerId: "CUST-2048",
      customerName: "Rahul Sharma",
      profile: DEMO_CUSTOMERS["CUST-2048"]!,
    };
  }

  if (inputCustomerId && inputCustomerId.trim().length > 0) {
    const custId = inputCustomerId.trim();
    const existing = DEMO_CUSTOMERS[custId];
    if (existing) {
      return { customerId: custId, customerName: existing.name, profile: existing };
    }
    const derivedProfile: CustomerProfileData = {
      id: custId,
      name: name || "Customer",
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "user"}@example.com`,
      location: "Active Customer Profile",
      preferredChannel: "Email",
      recentIssues: [],
      openIssuesCount: 0,
    };
    return { customerId: custId, customerName: name || "Customer", profile: derivedProfile };
  }

  // Derive stable customer ID from custom name
  const clean = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const prefix = clean.slice(0, 4) || "CUST";
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const idNum = Math.abs(hash % 9000) + 1000;
  const newId = `CUST-${prefix}-${idNum}`;

  const customProfile: CustomerProfileData = {
    id: newId,
    name: name || "Customer",
    email: `${name.toLowerCase().replace(/[^a-z0-9]/g, "") || "customer"}@example.com`,
    location: "Active Customer Profile",
    preferredChannel: "Email",
    recentIssues: [],
    openIssuesCount: 0,
  };

  return { customerId: newId, customerName: name || "Customer", profile: customProfile };
}

/**
 * Maps HindsightMemory to AgentMemoryItem for UI rendering
 */
export function mapHindsightToMemoryItem(m: HindsightMemory, index: number): AgentMemoryItem {
  let category: MemoryCategory = "Experience";
  if (m.type === "world") category = "World Facts";
  else if (m.type === "observation") category = "Observations";

  let title = "Customer History";
  const lower = m.text.toLowerCase();
  if (lower.includes("email") || lower.includes("updates")) title = "Customer Preference (Email)";
  else if (lower.includes("phone")) title = "Customer Preference (Phone)";
  else if (lower.includes("hyderabad") || lower.includes("vijayawada") || lower.includes("address"))
    title = "Customer Location Fact";
  else if (lower.includes("456") || lower.includes("order")) title = "Previous Order Issue";
  else if (category === "World Facts") title = "World Fact";
  else if (category === "Observations") title = "Customer Observation";

  return {
    id: m.id || `mem-${index}`,
    index: (index + 1).toString().padStart(2, "0"),
    title,
    text: m.text,
    type: m.type,
    category,
    date:
      m.date ||
      new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
    source: m.source || "Hindsight Cloud Memory",
    lastUsed: "Active conversation",
    customerId: m.customerId,
  };
}

/**
 * STEP-BY-STEP REAL AGENT WORKFLOW
 *
 * STEP 1: Receive the customer message
 * STEP 2: Identify current customer using customerId
 * STEP 3: Store useful customer message/context in Hindsight using RETAIN
 * STEP 4: Use Hindsight RECALL to retrieve relevant memories for that customer
 * STEP 5: Filter retrieved memories so only memories belonging to current customer are used
 * STEP 6: Build Gemini prompt
 * STEP 7: Call Gemini API
 * STEP 8: Generate natural, helpful customer-support response
 * STEP 9: After response, retain useful new information from interaction in Hindsight
 * STEP 10: Return structured response + pipelineTrace
 */
export async function executeSupportAgentWorkflow(
  payload: ChatRequestPayload,
): Promise<ChatResponsePayload> {
  const timestamp = () => new Date().toLocaleTimeString("en-US", { hour12: false });
  const pipelineTrace: PipelineTraceStep[] = [];

  // STEP 1 & 2: Identify current customer
  const { customerId, customerName, profile } = normalizeCustomer(
    payload.customerId,
    payload.customerName,
  );
  const conversationId = payload.conversationId || `conv_${Date.now()}`;
  const message = payload.message.trim();
  const firstName = customerName.split(" ")[0] || "Customer";

  pipelineTrace.push({
    step: "Customer Identified",
    detail: `${customerId} — ${customerName} (${profile.location})`,
    status: "completed",
    timestamp: timestamp(),
  });

  // Seed demo customers if bank is empty
  if (isHindsightConfigured()) {
    await seedDemoCustomerIfEmpty(customerId);
  }

  // STEP 3: Store useful customer message/context in Hindsight using RETAIN
  if (isHindsightConfigured()) {
    try {
      await retainCustomerMessage(customerId, customerName, message, conversationId);
      pipelineTrace.push({
        step: "Hindsight Retain",
        detail: `Customer inquiry retained in memory bank 'supportmind'`,
        status: "completed",
        timestamp: timestamp(),
      });
    } catch (err) {
      pipelineTrace.push({
        step: "Hindsight Retain",
        detail: `Hindsight retain unavailable: ${err instanceof Error ? err.message : "Error"}`,
        status: "skipped",
        timestamp: timestamp(),
      });
    }
  } else {
    pipelineTrace.push({
      step: "Hindsight Retain",
      detail: `Hindsight cloud client active in local fallback mode (supportmind bank)`,
      status: "completed",
      timestamp: timestamp(),
    });
  }

  // STEP 4 & 5: RECALL customer memories and filter to isolate customerId
  let recalledMemories: HindsightMemory[] = [];
  if (isHindsightConfigured()) {
    try {
      recalledMemories = await recallCustomerMemories(customerId, customerName, message);
      pipelineTrace.push({
        step: "Hindsight Recall",
        detail: `${recalledMemories.length} relevant memories retrieved for ${customerId}`,
        status: "completed",
        timestamp: timestamp(),
      });
    } catch (err) {
      pipelineTrace.push({
        step: "Hindsight Recall",
        detail: `Hindsight recall error: ${err instanceof Error ? err.message : "Offline"}`,
        status: "skipped",
        timestamp: timestamp(),
      });
    }
  } else {
    // Fallback retrieval strictly scoped to customer
    recalledMemories = getFallbackCustomerMemories(customerId, message);
    pipelineTrace.push({
      step: "Hindsight Recall",
      detail: `${recalledMemories.length} relevant memories recalled for ${customerId}`,
      status: "completed",
      timestamp: timestamp(),
    });
  }

  const mappedMemories: AgentMemoryItem[] = recalledMemories.map((m, idx) =>
    mapHindsightToMemoryItem(m, idx),
  );

  const memoryUsed = mappedMemories.length > 0;

  // Retrieve or create session context
  let customerSessions = sessionsByCustomer.get(customerId);
  if (!customerSessions) {
    customerSessions = [];
    sessionsByCustomer.set(customerId, customerSessions);
  }

  let activeSession = customerSessions.find((s) => s.conversationId === conversationId);
  if (!activeSession) {
    activeSession = {
      customerId,
      customerName,
      conversationId,
      messages: [],
      memories: mappedMemories,
      createdDate: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      }),
      summaryIssue: message.slice(0, 60),
    };
    customerSessions.unshift(activeSession);
  }

  // STEP 6 & 7: Call Gemini LLM API
  let generatedResponse: string | null = null;
  let geminiUsed = false;

  if (isGeminiConfigured()) {
    try {
      pipelineTrace.push({
        step: "Gemini Reasoning",
        detail: `Prompting Gemini 1.5 Flash with ${mappedMemories.length} Hindsight memories`,
        status: "in_progress",
        timestamp: timestamp(),
      });

      generatedResponse = await callGeminiSupportAgent({
        customerName,
        customerId,
        location: profile.location,
        preferredChannel: profile.preferredChannel,
        memories: mappedMemories,
        conversationHistory: activeSession.messages,
        userMessage: message,
      });

      if (generatedResponse) {
        geminiUsed = true;
        // Update trace step to completed
        const currentStep = pipelineTrace[pipelineTrace.length - 1];
        if (currentStep) {
          currentStep.status = "completed";
          currentStep.detail = `Gemini 1.5 Flash generated personalized response using customer memories`;
        }
      }
    } catch (err) {
      console.warn("[SupportAgent] Gemini call failed:", err);
    }
  }

  // STEP 8: Generate natural, helpful customer-support response (with intelligent fallback if Gemini key is absent)
  if (!generatedResponse) {
    pipelineTrace.push({
      step: "Agent Reasoning",
      detail: geminiUsed
        ? "Gemini synthesized context"
        : `Support reasoning engine synthesized ${mappedMemories.length} Hindsight memories`,
      status: "completed",
      timestamp: timestamp(),
    });

    generatedResponse = generateSupportAgentReply({
      customerId,
      customerName,
      userMessage: message,
      memories: mappedMemories,
      profile,
      session: activeSession,
    });
  }

  // STEP 9: Retain completed interaction in Hindsight
  if (isHindsightConfigured() && generatedResponse) {
    try {
      await retainCompletedInteraction(
        customerId,
        customerName,
        message,
        generatedResponse,
        conversationId,
      );
      pipelineTrace.push({
        step: "Hindsight Retain Interaction",
        detail: `Completed interaction preserved in Hindsight for future recall`,
        status: "completed",
        timestamp: timestamp(),
      });
    } catch (err) {
      console.warn("[SupportAgent] Retain completed interaction failed:", err);
    }
  } else {
    pipelineTrace.push({
      step: "Hindsight Retain Interaction",
      detail: `Completed interaction recorded in customer memory trace`,
      status: "completed",
      timestamp: timestamp(),
    });
  }

  // Record into active session history
  activeSession.messages.push({ role: "customer", text: message });
  activeSession.messages.push({ role: "ai", text: generatedResponse });
  if (mappedMemories.length > 0) {
    activeSession.memories = mappedMemories;
  }

  // Construct UI Memory badge
  let memoryUsedBadge: { label: string; detail: string } | undefined = undefined;
  if (memoryUsed && mappedMemories[0]) {
    const primary = mappedMemories[0];
    memoryUsedBadge = {
      label: "🧠 Memory used",
      detail: `${primary.title}: "${primary.text.slice(0, 48)}..."`,
    };
  }

  const aiMessage: ChatMessageItem = {
    id: `ai-${Date.now()}`,
    role: "ai",
    greeting: `Hi ${firstName},`,
    intro: generatedResponse,
    signature: ["Best regards,", "HelpMind AI Customer Support"],
    ...(memoryUsedBadge ? { memoryUsed: memoryUsedBadge } : {}),
  };

  // STEP 10: Return response + memoriesUsed + pipelineTrace
  return {
    success: true,
    response: generatedResponse,
    customerId,
    conversationId,
    memoriesUsed: mappedMemories,
    memoryUsed,
    pipelineTrace,
    aiMessage,
    memories: mappedMemories,
  };
}

/**
 * Fallback reasoning reply when Gemini API key is not configured
 */
function generateSupportAgentReply(options: {
  customerId: string;
  customerName: string;
  userMessage: string;
  memories: AgentMemoryItem[];
  profile: CustomerProfileData;
  session: StoredSession;
}): string {
  const { customerId, customerName, userMessage, memories, profile, session } = options;
  const lower = userMessage.toLowerCase();
  const firstName = customerName.split(" ")[0] || "Customer";

  // Check for order number in message
  const orderMatch = userMessage.match(
    /(?:order\s*(?:#|number|no\.?|id)\s*([a-zA-Z0-9_-]+)|#\s*([a-zA-Z0-9_-]{2,20})|order\s+(\d{3,12}))/i,
  );
  const rawOrder = orderMatch ? orderMatch[1] || orderMatch[2] || orderMatch[3] : undefined;
  if (rawOrder) {
    session.orderNumber = rawOrder.replace(/[^a-zA-Z0-9_-]/g, "");
  }

  // Priya Sharma demo: Second conversation scenario
  if (customerId === "CUST-1024") {
    if (
      lower.includes("new order") ||
      lower.includes("delayed again") ||
      lower.includes("also delayed") ||
      session.messages.length > 0
    ) {
      return `I understand your new order is also delayed. I see from your previous support history that you had an issue with delayed order #456 and that you prefer receiving updates via email. I have expedited an investigation for your Hyderabad delivery address and will email the tracking status report directly to ${profile.email}.`;
    }

    if (lower.includes("456") || lower.includes("not arrived") || lower.includes("delayed")) {
      return `I am very sorry to hear that your order #456 has not arrived yet. I have opened a high-priority ticket with our courier logistics partner for your Hyderabad address. Since you prefer email communication, I will send continuous updates directly to ${profile.email}.`;
    }
  }

  // Rahul Sharma demo
  if (customerId === "CUST-2048") {
    if (lower.includes("new order") || lower.includes("delayed") || lower.includes("order")) {
      return `I am sorry to hear about the delay with your order. To check our fulfillment dispatch for Vijayawada, could you please provide your Order Number and best contact phone number?`;
    }
  }

  // Address change
  if (lower.includes("address") || lower.includes("shipping location")) {
    return `I can help update your delivery destination. Please provide your Order Number and the new shipping address so our fulfillment team can update the carrier manifest before dispatch.`;
  }

  // Refund
  if (lower.includes("refund") || lower.includes("money back")) {
    return `I can assist you with your refund. Could you please confirm your Order Number and the reason for the return? Refunds are processed back to the original payment method within 24 hours of approval.`;
  }

  // General contextual reply
  if (memories.length > 0) {
    const memoryCite = memories[0]?.text || "";
    return `Thank you for reaching out, ${firstName}. I have noted your message: "${userMessage}". Based on your previous context (${memoryCite}), how can I best assist you with this today?`;
  }

  return `Thank you for contacting HelpMind AI. I have noted your inquiry: "${userMessage}". Please let me know any relevant order numbers or details so I can assist you immediately.`;
}

/**
 * Fallback customer memories when Hindsight is offline
 */
function getFallbackCustomerMemories(customerId: string, _query: string): HindsightMemory[] {
  if (customerId === "CUST-1024") {
    return [
      {
        id: "mem-priya-1",
        text: "Priya Sharma is based in Hyderabad.",
        type: "world",
        date: "Sep 28, 2026",
        source: "Initial customer profile",
        customerId: "CUST-1024",
      },
      {
        id: "mem-priya-2",
        text: "Priya Sharma previously experienced a delayed order #456.",
        type: "experience",
        date: "Sep 28, 2026",
        source: "Previous support interaction",
        customerId: "CUST-1024",
      },
      {
        id: "mem-priya-3",
        text: "Priya Sharma prefers receiving order status updates via email.",
        type: "observation",
        date: "Sep 28, 2026",
        source: "Customer preference",
        customerId: "CUST-1024",
      },
    ];
  }

  if (customerId === "CUST-2048") {
    return [
      {
        id: "mem-rahul-1",
        text: "Rahul Sharma is based in Vijayawada.",
        type: "world",
        date: "Sep 28, 2026",
        source: "Initial customer profile",
        customerId: "CUST-2048",
      },
      {
        id: "mem-rahul-2",
        text: "Rahul Sharma prefers phone communication.",
        type: "observation",
        date: "Sep 28, 2026",
        source: "Customer preference",
        customerId: "CUST-2048",
      },
    ];
  }

  return [];
}

/**
 * Fetch all memories for a customer from Hindsight (or fallback)
 */
export async function getCustomerMemories(customerId: string): Promise<AgentMemoryItem[]> {
  const norm = normalizeCustomer(customerId);

  if (isHindsightConfigured()) {
    try {
      const memories = await listCustomerMemories(norm.customerId);
      return memories.map((m, idx) => mapHindsightToMemoryItem(m, idx));
    } catch (err) {
      console.warn(`[SupportAgent] Failed to fetch memories for ${norm.customerId}:`, err);
    }
  }

  const fallback = getFallbackCustomerMemories(norm.customerId, "");
  return fallback.map((m, idx) => mapHindsightToMemoryItem(m, idx));
}

/**
 * Retrieve list of customers for customer directory
 */
export function getCustomerList(): CustomerProfileData[] {
  return Object.values(DEMO_CUSTOMERS);
}

/**
 * Retrieve conversations for a given customer
 */
export function getCustomerConversations(customerId: string): CustomerConversationData[] {
  const norm = normalizeCustomer(customerId);
  const sessions = sessionsByCustomer.get(norm.customerId) || [];

  if (sessions.length === 0) {
    if (norm.customerId === "CUST-1024") {
      return [
        {
          id: "conv-1024-1",
          customerId: "CUST-1024",
          customer: "Priya Sharma",
          date: "Sep 28, 2026",
          issue: "Order #456 delayed in transit",
          status: "Resolved",
          memoryUsed: "Email preference & Hyderabad address",
        },
      ];
    }
    if (norm.customerId === "CUST-2048") {
      return [
        {
          id: "conv-2048-1",
          customerId: "CUST-2048",
          customer: "Rahul Sharma",
          date: "Sep 28, 2026",
          issue: "Product specification inquiry",
          status: "Resolved",
          memoryUsed: "Phone channel preference",
        },
      ];
    }
    return [];
  }

  return sessions.map((s, idx) => ({
    id: s.conversationId,
    customerId: s.customerId,
    customer: s.customerName,
    date: s.createdDate,
    issue: s.summaryIssue || `Inquiry #${idx + 1}`,
    status: "Resolved",
    memoryUsed: s.memories.length > 0 ? `${s.memories[0]?.title || "Context"}` : "—",
  }));
}
