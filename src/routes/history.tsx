import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Brain, Calendar, CheckCircle2, History, UserCheck, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/helpmind/PageShell";
import { useCustomerName } from "@/lib/use-customer-name";
import type { CustomerConversationData } from "@/server/services/support-agent";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Conversation History — HelpMind AI" },
      {
        name: "description",
        content: "Past support conversations, their resolutions and the memories that helped.",
      },
      { property: "og:title", content: "Conversation History — HelpMind AI" },
      {
        property: "og:description",
        content: "Review resolved support conversations and the memory used in each one.",
      },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { customerId: activeCustomerId } = useCustomerName();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    activeCustomerId || "CUST-1024",
  );
  const [conversations, setConversations] = useState<CustomerConversationData[]>([]);

  useEffect(() => {
    fetch(`/api/conversations?customerId=${encodeURIComponent(selectedCustomerId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.conversations)) {
          setConversations(data.conversations);
        }
      })
      .catch((err) => console.warn(err));
  }, [selectedCustomerId]);

  return (
    <PageShell
      title="Conversation History & Memory Traces"
      description="Audit how past interactions and preserved memory context contributed to successful ticket resolution."
    >
      <div className="space-y-5">
        {/* Customer Isolation Filter Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Filter by Customer:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedCustomerId("CUST-1024")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCustomerId === "CUST-1024"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Priya Sharma (CUST-1024)
              </button>
              <button
                type="button"
                onClick={() => setSelectedCustomerId("CUST-2048")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedCustomerId === "CUST-2048"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Rahul Sharma (CUST-2048)
              </button>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Strict Memory Isolation Active
          </span>
        </div>

        {/* History Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <History className="size-4 text-blue-600" />
              {conversations.length} Recorded Conversations for {selectedCustomerId}
            </span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
              Customer Scoped
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-600">
                <tr>
                  <th className="px-5 py-3.5">Customer & ID</th>
                  <th className="px-5 py-3.5">Issue Description</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Resolution Outcome</th>
                  <th className="px-5 py-3.5">Memory Leveraged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversations.length > 0 ? (
                  conversations.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                            {row.customer[0]}
                          </span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {row.customer}
                            </span>
                            <span className="text-[10px] font-mono text-blue-700 font-semibold">
                              {row.customerId}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700 text-xs">{row.issue}</td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="size-3 text-slate-400" />
                          {row.date}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                          <CheckCircle2 className="size-3 text-emerald-600" />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {row.memoryUsed === "—" ? (
                          <span className="text-slate-400 text-xs">—</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-900">
                            <Brain className="size-3 text-sky-600" />
                            {row.memoryUsed}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-slate-500">
                      No conversations recorded for this customer ID yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
