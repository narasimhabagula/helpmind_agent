import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/helpmind/Header";
import { SupportChat } from "@/components/helpmind/SupportChat";
import { MemoryPanel } from "@/components/helpmind/MemoryPanel";
import type { ChatMessageItem, MemoryItem } from "@/lib/demo-data";
import type { PipelineTraceStep } from "@/server/services/support-agent";
import { useCustomerName } from "@/lib/use-customer-name";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Customer Support Chat — HelpMind AI" },
      {
        name: "description",
        content:
          "Chat with HelpMind's AI support agent and see the memories it recalls for each response.",
      },
      { property: "og:title", content: "Customer Support Chat — HelpMind AI" },
      {
        property: "og:description",
        content: "AI support chat with a live memory panel showing the context behind each reply.",
      },
    ],
  }),
  component: ChatPage,
});

function ChatPage() {
  const { name, customerId, sessionId, startNewSession, switchCustomer } = useCustomerName();
  // Starts completely EMPTY - zero hardcoded fake messages
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [pipelineTrace, setPipelineTrace] = useState<PipelineTraceStep[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Fetch real memories for this customer on mount and when customerId changes
  useEffect(() => {
    if (!customerId) return;

    fetch(
      `/api/memory?customerId=${encodeURIComponent(customerId)}&customerName=${encodeURIComponent(name || "")}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.memories)) {
          setMemories(data.memories);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch customer memories:", err);
      });
  }, [customerId, name]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsgId = `u-${Date.now()}`;
    const userMsg: ChatMessageItem = {
      id: userMsgId,
      role: "customer",
      text: trimmed,
      timestamp: nowTime,
    };

    // 1. Immediately append customer message to visible chat
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setNotice(null);

    try {
      // 2. Send message to backend agent workflow (POST /api/chat)
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customerId || "CUST-1024",
          customerName: name || "Customer",
          message: trimmed,
          conversationId: sessionId || `conv_${Date.now()}`,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      if (data.aiMessage) {
        setMessages((prev) => [...prev, { ...data.aiMessage, timestamp: replyTime }]);
      } else if (data.response) {
        const fallbackMsg: ChatMessageItem = {
          id: `ai-${Date.now()}`,
          role: "ai",
          intro: data.response,
          timestamp: replyTime,
          signature: ["Best regards,", "HelpMind AI Customer Support"],
          ...(data.memoryUsed
            ? {
                memoryUsed: {
                  label: "🧠 Memory used",
                  detail: data.memoriesUsed?.[0]?.text
                    ? `${data.memoriesUsed[0].title || "Customer Memory"} — "${data.memoriesUsed[0].text.slice(0, 50)}..."`
                    : "Previous customer context recalled",
                },
              }
            : {}),
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }

      // Update AI Activity / Pipeline Trace
      if (Array.isArray(data.pipelineTrace) && data.pipelineTrace.length > 0) {
        setPipelineTrace(data.pipelineTrace);
      }

      // Update AI memory panel
      if (Array.isArray(data.memoriesUsed) && data.memoriesUsed.length > 0) {
        setMemories(data.memoriesUsed);
      } else if (Array.isArray(data.memories) && data.memories.length > 0) {
        setMemories(data.memories);
      } else {
        // Re-sync customer memories
        fetch(`/api/memory?customerId=${encodeURIComponent(customerId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((memData) => {
            if (Array.isArray(memData?.memories)) {
              setMemories(memData.memories);
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error("Failed to send message to AI agent:", err);
      // Fallback friendly message if backend encounters an error
      const errTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const fallbackAiMsg: ChatMessageItem = {
        id: `ai-err-${Date.now()}`,
        role: "ai",
        greeting: `Hi ${name.split(" ")[0] || "there"},`,
        timestamp: errTime,
        intro:
          "HelpMind is temporarily unable to access customer memory. You can still continue with standard support.",
        signature: ["Best regards,", "HelpMind AI Support"],
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = async () => {
    const oldSessionId = sessionId;
    const nextSession = startNewSession();

    // Call backend reset
    fetch("/api/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: oldSessionId }),
    }).catch(() => {});

    // Clear visible messages to start empty conversation for same customer
    setMessages([]);
    setNotice(
      "Started Conversation 2 for " +
        name +
        ". Previous memories remain securely preserved in Hindsight.",
    );
  };

  const handleSwitchCustomer = (newName: string, newId: string) => {
    switchCustomer(newName, newId);
    setMessages([]);
    setNotice(
      `Switched customer context to ${newName} (${newId}). Clean isolated session initialized.`,
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col bg-slate-50">
      {/* Subtle single-tone ambient glow */}
      <div className="pointer-events-none fixed top-16 left-1/3 -z-10 size-96 rounded-full bg-blue-500/5 blur-3xl" />

      <Header
        customerName={name}
        customerId={customerId}
        onNewChat={handleNewChat}
        onSwitchCustomer={handleSwitchCustomer}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-3 py-3 sm:px-5 lg:py-4">
        {/* Two-Column SaaS Workspace: LEFT/CENTER CHATBOT (72-75%), RIGHT MEMORY CONTEXT & TRACE (25-28%) */}
        <div className="grid gap-5 lg:h-[calc(100vh-6.8rem)] lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_420px]">
          {/* LEFT / CENTER: Support Chat (Dominant Primary Workspace) */}
          <div className="min-h-[70vh] lg:min-h-0 h-full">
            <SupportChat
              messages={messages}
              name={name}
              notice={notice}
              isLoading={isLoading}
              onSend={handleSend}
            />
          </div>

          {/* RIGHT: Memory Context + AI Activity Trace */}
          <aside className="scroll-slim hidden lg:block lg:overflow-y-auto lg:pr-1 h-full">
            <MemoryPanel
              customerName={name}
              customerId={customerId}
              memories={memories}
              pipelineTrace={pipelineTrace}
              isLoading={isLoading}
            />
          </aside>

          {/* Mobile View: Vertically stacked */}
          <div className="space-y-4 lg:hidden">
            <MemoryPanel
              customerName={name}
              customerId={customerId}
              memories={memories}
              pipelineTrace={pipelineTrace}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
