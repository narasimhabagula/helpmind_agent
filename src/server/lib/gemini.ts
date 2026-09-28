// Server-side Google Gemini LLM Integration
// Strictly server-side: Never expose GEMINI_API_KEY to browser/client
import "./env.ts";
import { GoogleGenAI } from "@google/genai";

export function isGeminiConfigured(): boolean {
  const key = process.env["GEMINI_API_KEY"];
  return Boolean(key && key.trim().length > 0);
}

export interface CallGeminiOptions {
  customerName: string;
  customerId: string;
  location?: string;
  preferredChannel?: string;
  memories: Array<{ text: string; type?: string; title?: string }>;
  conversationHistory: Array<{ role: "customer" | "ai"; text: string }>;
  userMessage: string;
}

/**
 * Calls the Google Gemini API to generate a personalized customer support response.
 * Uses official @google/genai SDK with structured context and strict memory grounding.
 */
export async function callGeminiSupportAgent(options: CallGeminiOptions): Promise<string | null> {
  const apiKey = process.env["GEMINI_API_KEY"];
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }

  const {
    customerName,
    customerId,
    location,
    preferredChannel,
    memories,
    conversationHistory,
    userMessage,
  } = options;

  const firstName = customerName.split(" ")[0] || "Customer";

  // Build Hindsight memory context list
  const memoryLines =
    memories.length > 0
      ? memories.map((m) => `- ${m.text}`).join("\n")
      : "- No previous support memories found for this customer.";

  // Strict structured context matching HelpMind architecture specification
  const structuredPrompt = `CURRENT CUSTOMER:
Name: ${customerName}
Customer ID: ${customerId}
Location: ${location || "Not specified"}
Preferred communication: ${preferredChannel || "Email"}

CURRENT MESSAGE:
"${userMessage}"

RELEVANT HINDSIGHT MEMORIES:
${memoryLines}

INSTRUCTIONS:
You are HelpMind, a professional customer-support AI.
Use the relevant customer memories when they help answer the current request.
Do not invent customer history.
Do not claim to remember information that was not provided by Hindsight.
Do not use memories belonging to another customer.
Give a concise, helpful and personalized response.
Address the customer warmly ("Hi ${firstName},") and sign off with ("Best regards,\\nHelpMind AI Customer Support").`;

  // First, attempt official GoogleGenAI SDK
  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build multi-turn contents if history exists
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Recent conversation turns (last 4 messages for multi-turn coherence)
    for (const msg of conversationHistory.slice(-4)) {
      if (msg.role === "customer" && msg.text) {
        contents.push({ role: "user", parts: [{ text: msg.text }] });
      } else if (msg.role === "ai" && msg.text) {
        contents.push({ role: "model", parts: [{ text: msg.text }] });
      }
    }

    // Append the structured prompt with user message and memories
    contents.push({
      role: "user",
      parts: [{ text: structuredPrompt }],
    });

    const modelCandidates = [
      "gemini-3.5-flash-lite",
      "gemini-2.5-flash",
      "gemini-3.5-flash",
      "gemini-1.5-flash",
    ];

    for (const model of modelCandidates) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            temperature: 0.3,
            maxOutputTokens: 700,
            systemInstruction: `You are HelpMind, a professional, memory-powered customer support AI. Ground responses strictly in the provided Hindsight customer memories. Never invent customer data or expose internal tokens.`,
          },
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (modelErr) {
        console.warn(`[Gemini SDK] Model ${model} attempt failed:`, modelErr);
      }
    }
  } catch (sdkErr) {
    console.warn("[Gemini SDK] SDK call attempt failed, trying REST fallback:", sdkErr);
  }

  // REST API Fallback
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;

    const contents = [
      {
        role: "user",
        parts: [{ text: structuredPrompt }],
      },
    ];

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 700,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Gemini REST] Request failed with status ${response.status}:`, errText);
      return null;
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return candidateText || null;
  } catch (fetchErr) {
    console.warn("[Gemini REST] Fallback call encountered error:", fetchErr);
    return null;
  }
}
