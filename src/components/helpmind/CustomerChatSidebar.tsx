import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MessageSquare, Plus, Brain, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CustomerConversationData } from "@/server/services/support-agent";

export function CustomerChatSidebar({
  currentCustomerId,
  onNewConversation,
}: {
  currentCustomerId: string;
  currentCustomerName?: string;
  onSwitchCustomer?: (name: string, id: string) => void;
  onNewConversation: () => void;
}) {
  const [conversations, setConversations] = useState<CustomerConversationData[]>([]);

  useEffect(() => {
    fetch(`/api/conversations?customerId=${encodeURIComponent(currentCustomerId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.conversations)) {
          setConversations(data.conversations);
        }
      })
      .catch((err) => console.warn(err));
  }, [currentCustomerId]);

  return (
    <aside className="scroll-slim flex h-full flex-col gap-3 overflow-y-auto pr-1">
      {/* 1. New Conversation Action Button */}
      <Button
        onClick={onNewConversation}
        variant="default"
        size="sm"
        className="w-full gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white hover:bg-blue-700 shadow-xs cursor-pointer py-2.5 h-auto"
      >
        <Plus className="size-4" />
        <span>New Conversation</span>
      </Button>

      {/* 2. Previous Sessions List */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs space-y-3 flex flex-col min-h-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <History className="size-3.5 text-blue-600" />
            Previous Sessions
          </h3>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
            {conversations.length}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs transition-colors hover:bg-slate-100/70 hover:border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-slate-400">{conv.date}</span>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[10px] font-bold text-emerald-700">
                    {conv.status}
                  </span>
                </div>
                <p className="mt-1 font-semibold text-slate-900 truncate leading-snug">
                  {conv.issue}
                </p>
                {conv.memoryUsed && conv.memoryUsed !== "—" ? (
                  <p className="mt-1 text-[11px] text-sky-800 flex items-center gap-1 font-medium truncate">
                    <Brain className="size-3 text-sky-600 shrink-0" />
                    <span className="truncate">Memory: {conv.memoryUsed}</span>
                  </p>
                ) : null}
              </div>
            ))
          ) : (
            <div className="py-6 text-center">
              <MessageSquare className="size-6 text-slate-300 mx-auto mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">No previous sessions</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                New interactions will automatically appear here.
              </p>
            </div>
          )}
        </div>

        {/* 3. Link to Full Conversation History */}
        <div className="pt-2 border-t border-slate-100">
          <Link
            to="/history"
            className="flex items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-colors"
          >
            <span>View Full History</span>
            <ArrowRight className="size-3.5 text-blue-600" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
