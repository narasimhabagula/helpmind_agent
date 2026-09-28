import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Users,
  UserCheck,
  Mail,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  Brain,
} from "lucide-react";
import { PageShell } from "@/components/helpmind/PageShell";
import { Button } from "@/components/ui/button";
import { useCustomerName } from "@/lib/use-customer-name";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers Directory — HelpMind AI" },
      {
        name: "description",
        content: "Manage customer profiles, verify memory isolation, and launch support sessions.",
      },
    ],
  }),
  component: CustomersPage,
});

interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  location: string;
  preferredChannel: string;
  recentIssues: string[];
  openIssuesCount: number;
}

function CustomersPage() {
  const navigate = useNavigate();
  const { customerId: activeId, switchCustomer } = useCustomerName();
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedId, setSelectedId] = useState<string>(activeId || "CUST-1024");

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.customers)) {
          setCustomers(data.customers);
        }
      })
      .catch((err) => console.warn(err));
  }, []);

  const selectedCustomer = customers.find((c) => c.id === selectedId) || customers[0];

  const handleStartChat = (c: CustomerProfile) => {
    switchCustomer(c.name, c.id);
    navigate({ to: "/chat" });
  };

  return (
    <PageShell
      title="Customer Profiles & Context Directory"
      description="Inspect verified customer identities, contact channels, and isolated memory boundaries."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left: Customer List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
              <Users className="size-4 text-blue-600" />
              Customer Directory
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              {customers.length} Profiles
            </span>
          </div>

          <div className="space-y-2.5">
            {customers.map((c) => {
              const isSelected = c.id === (selectedCustomer?.id || "");
              const isCurrentSession = c.id === activeId;

              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={`w-full cursor-pointer text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-600"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-sm shadow-xs">
                        {c.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 text-sm truncate">{c.name}</p>
                        <p className="text-[11px] font-mono text-blue-700 font-semibold">{c.id}</p>
                      </div>
                    </div>

                    {isCurrentSession ? (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        Active
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3 text-slate-400" />
                      {c.location.split(",")[0]}
                    </span>
                    <span className="font-medium text-slate-600">
                      Channel: {c.preferredChannel}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Detailed Customer Profile View */}
        {selectedCustomer ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3.5">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white shadow-xs">
                  {selectedCustomer.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-slate-900">
                      {selectedCustomer.name}
                    </h2>
                    <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs font-mono font-bold text-blue-700">
                      {selectedCustomer.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Verified Customer Identity with Hindsight Isolation Boundary
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleStartChat(selectedCustomer)}
                className="gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-xs hover:bg-blue-700 cursor-pointer"
              >
                <span>Launch Chat as {selectedCustomer.name.split(" ")[0]}</span>
                <ArrowRight className="size-4" />
              </Button>
            </div>

            {/* Profile Fields Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <Mail className="size-3.5 text-blue-600" />
                  Primary Email
                </span>
                <p className="font-semibold text-slate-900 text-sm">{selectedCustomer.email}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <MapPin className="size-3.5 text-blue-600" />
                  Delivery Location
                </span>
                <p className="font-semibold text-slate-900 text-sm">{selectedCustomer.location}</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <MessageSquare className="size-3.5 text-sky-600" />
                  Preferred Communication
                </span>
                <p className="font-semibold text-slate-900 text-sm">
                  {selectedCustomer.preferredChannel} Updates (Strictly Respected)
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                  <ShieldCheck className="size-3.5 text-emerald-600" />
                  Memory Partitioning
                </span>
                <p className="font-semibold text-emerald-800 text-sm">
                  Isolated in Hindsight bank &apos;supportmind&apos;
                </p>
              </div>
            </div>

            {/* Recent Issues / Context */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-5 space-y-3">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Clock className="size-4 text-slate-500" />
                Recent Support Inquiries & Active Topics
              </h3>
              {selectedCustomer.recentIssues.length > 0 ? (
                <ul className="space-y-2">
                  {selectedCustomer.recentIssues.map((issue) => (
                    <li
                      key={issue}
                      className="flex items-center justify-between rounded-lg bg-white border border-slate-200 px-3.5 py-2.5 text-xs text-slate-800 shadow-2xs font-medium"
                    >
                      <span>{issue}</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700">
                        <Brain className="size-3 text-sky-600" />
                        Retained in Memory
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  No active inquiries recorded for this profile yet.
                </p>
              )}
            </div>

            {/* Security Guarantee Banner */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-950 flex items-start gap-3">
              <UserCheck className="size-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero Cross-Customer Memory Leakage:</span>
                <p className="mt-0.5 text-emerald-800">
                  HelpMind AI filters all Hindsight recall operations strictly by{" "}
                  <code className="font-mono bg-white px-1 py-0.5 rounded border border-emerald-200 font-bold">
                    {selectedCustomer.id}
                  </code>
                  . Another customer will never see or reason with this profile&apos;s memories.
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
