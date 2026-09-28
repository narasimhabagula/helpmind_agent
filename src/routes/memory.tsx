import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Brain, Database } from "lucide-react";
import { PageShell } from "@/components/helpmind/PageShell";
import { MemoryCard } from "@/components/helpmind/MemoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MemoryItem } from "@/lib/demo-data";
import { useCustomerName } from "@/lib/use-customer-name";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "Customer Memory — HelpMind AI" },
      {
        name: "description",
        content:
          "Browse the facts, experiences and observations HelpMind remembers about each customer.",
      },
      { property: "og:title", content: "Customer Memory — HelpMind AI" },
      {
        property: "og:description",
        content: "Every memory HelpMind stores, with category, source and last used date.",
      },
    ],
  }),
  component: MemoryPage,
});

const tabs = ["All", "World Facts", "Experience", "Observations"] as const;

function MemoryPage() {
  const { customerId: currentCustomerId } = useCustomerName();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    currentCustomerId || "CUST-1024",
  );
  const [customerMemories, setCustomerMemories] = useState<MemoryItem[]>([]);
  const [customerName, setCustomerName] = useState<string>(
    selectedCustomerId === "CUST-2048" ? "Rahul Sharma" : "Priya Sharma",
  );

  useEffect(() => {
    setCustomerName(selectedCustomerId === "CUST-2048" ? "Rahul Sharma" : "Priya Sharma");
    fetch(
      `/api/memory?customerId=${encodeURIComponent(selectedCustomerId)}&customerName=${encodeURIComponent(
        selectedCustomerId === "CUST-2048" ? "Rahul Sharma" : "Priya Sharma",
      )}`,
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.memories)) {
          setCustomerMemories(data.memories);
        }
      })
      .catch((err) => console.warn(err));
  }, [selectedCustomerId]);

  return (
    <PageShell
      title="Persistent Memory Bank"
      description="Transparent inspection of the vector knowledge graph and semantic customer memories retained by HelpMind."
    >
      <div className="space-y-6">
        {/* Customer Isolation Filter Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Customer Memory Scope:
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
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-bold text-emerald-800">
              🔒 Bank: supportmind
            </span>
            <span className="font-mono text-slate-500 font-medium">
              Tag: [{selectedCustomerId}]
            </span>
          </div>
        </div>
        <Tabs defaultValue="All" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <TabsList className="flex-wrap bg-slate-100 p-1 rounded-xl border border-slate-200">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg px-4 py-1.5 text-xs font-bold transition-colors data-[state=active]:bg-blue-600 data-[state=active]:text-white shadow-none"
                >
                  {tab}
                  {tab === "All" && (
                    <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
                      {customerMemories.length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
                <Database className="size-3 text-sky-600" />
                Vector Store Synchronized
              </span>
            </div>
          </div>

          {tabs.map((tab) => {
            const list =
              tab === "All" ? customerMemories : customerMemories.filter((m) => m.category === tab);
            return (
              <TabsContent key={tab} value={tab} className="space-y-6">
                {list.length === 0 ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
                    <Database className="size-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-700">
                      No memories found for this customer.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Interact with HelpMind AI in Support Chat to automatically capture
                      preferences, address changes, and order status.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      {list.map((memory) => (
                        <MemoryCard key={memory.id} memory={memory} />
                      ))}
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                      <div className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Brain className="size-4 text-blue-600" />
                          Memory Metadata Index
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left text-sm">
                          <thead className="border-b border-slate-200 bg-slate-50/50 text-xs font-bold text-slate-600">
                            <tr>
                              <th className="px-5 py-3.5">Memory Description</th>
                              <th className="px-5 py-3.5">Category</th>
                              <th className="px-5 py-3.5">Stored Date</th>
                              <th className="px-5 py-3.5">Source Channel</th>
                              <th className="px-5 py-3.5">Last Recalled</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {list.map((memory) => (
                              <tr
                                key={memory.id}
                                className="transition-colors hover:bg-slate-50/80"
                              >
                                <td className="max-w-[340px] px-5 py-3.5 font-medium text-slate-900">
                                  {memory.text}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800">
                                    {memory.category}
                                  </span>
                                </td>
                                <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">
                                  {memory.date}
                                </td>
                                <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">
                                  {memory.source}
                                </td>
                                <td className="px-5 py-3.5">
                                  <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                                    {memory.lastUsed}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </PageShell>
  );
}
