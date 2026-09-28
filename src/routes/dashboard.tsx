import { createFileRoute } from "@tanstack/react-router";
import { Brain, Activity, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { PageShell } from "@/components/helpmind/PageShell";
import { DashboardCard } from "@/components/helpmind/DashboardCard";
import { dashboardStats, memoryResolutions, recentActivity } from "@/lib/demo-data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Support Dashboard — HelpMind AI" },
      {
        name: "description",
        content:
          "Overview of active conversations, customers helped and memory-assisted resolutions.",
      },
      { property: "og:title", content: "Support Dashboard — HelpMind AI" },
      {
        property: "og:description",
        content: "Track support volume and how often stored memory resolves customer issues.",
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <PageShell
      title="Support Performance Dashboard"
      description="Real-time metrics on customer satisfaction, resolution velocity, and memory utilization impact."
    >
      {/* 4 Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <DashboardCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Activity className="size-4" />
              </span>
              Recent Support Activity
            </h2>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
              Live Feed
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <li
                key={item.customer + item.time}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                    {item.customer[0]}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{item.customer}</p>
                    <p className="truncate text-xs font-medium text-slate-500">{item.issue}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span
                    className={
                      item.status === "Resolved"
                        ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700"
                        : "inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[11px] font-bold text-blue-700"
                    }
                  >
                    {item.status === "Resolved" ? (
                      <CheckCircle2 className="size-3 text-emerald-600" />
                    ) : (
                      <Clock className="size-3 text-blue-600" />
                    )}
                    {item.status}
                  </span>
                  <p className="mt-1 text-[11px] font-medium text-slate-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Memory-Powered Resolutions */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-slate-900">
              <span className="flex size-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Brain className="size-4" />
              </span>
              Memory-Powered Resolutions
            </h2>
            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-800">
              High Impact
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {memoryResolutions.map((item) => (
              <li
                key={item.customer}
                className="rounded-xl border border-slate-100 border-l-4 border-l-sky-500 bg-slate-50/60 p-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">{item.customer}</p>
                  <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] font-bold text-sky-800">
                    <Sparkles className="size-2.5 text-sky-600" />
                    {item.memory}
                  </span>
                </div>
                <p className="mt-2 text-xs font-medium text-slate-600 leading-relaxed">
                  {item.outcome}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PageShell>
  );
}
