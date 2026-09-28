import { Brain, Database } from "lucide-react";
import type { MemoryItem } from "@/lib/demo-data";
import type { PipelineTraceStep } from "@/server/services/support-agent";
import { MemoryCard } from "./MemoryCard";
import { MemoryFlow } from "./MemoryFlow";
import { PipelineTracePanel } from "./PipelineTracePanel";

export function MemoryPanel({
  customerName,
  customerId,
  memories = [],
  pipelineTrace = [],
  isLoading = false,
}: {
  customerName: string;
  customerId?: string | undefined;
  memories?: MemoryItem[];
  pipelineTrace?: PipelineTraceStep[];
  isLoading?: boolean;
}) {
  const hasMemories = memories.length > 0;

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 1. MEMORY CONTEXT / MEMORY USED SECTION */}
      <section className="space-y-3">
        {/* Header Banner */}
        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4 shadow-2xs">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <span className="flex size-7 items-center justify-center rounded-lg bg-sky-600 text-white shadow-xs">
                  <Brain className="size-4" />
                </span>
                🧠 Memory Context
              </h2>
              <p className="mt-1 text-xs text-slate-600 font-medium truncate">
                Retrieved from Hindsight for {customerName} ({customerId || "CUST-1024"})
              </p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active ({memories.length})
            </span>
          </div>
        </div>

        {/* Memory cards list or clean empty state */}
        {hasMemories ? (
          <div className="space-y-2.5">
            {memories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-2xs">
            <span className="mx-auto flex size-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 mb-2">
              <Database className="size-4.5" />
            </span>
            <h3 className="text-xs font-bold text-slate-900">No relevant memories yet</h3>
            <p className="mt-1 text-[11px] text-slate-500 leading-relaxed">
              When this customer chats, relevant previous issues, preferences, and facts are
              recalled from Hindsight.
            </p>
          </div>
        )}
      </section>

      {/* 2. AI ACTIVITY TRACE SECTION */}
      <section className="space-y-3">
        <PipelineTracePanel trace={pipelineTrace} isLoading={isLoading} />
      </section>

      {/* 3. VISUAL PIPELINE FLOW */}
      <section>
        <MemoryFlow />
      </section>
    </div>
  );
}
