import { ArrowUpRight, Brain, CheckCircle2, MessageSquareText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const toneConfig = {
  primary: {
    accent: "bg-blue-600",
    border: "border-slate-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-blue-50 text-blue-600",
    icon: MessageSquareText,
  },
  memory: {
    accent: "bg-sky-600",
    border: "border-slate-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-sky-50 text-sky-600",
    icon: Brain,
  },
  success: {
    accent: "bg-emerald-600",
    border: "border-slate-200",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    iconBg: "bg-emerald-50 text-emerald-600",
    icon: CheckCircle2,
  },
};

export function DashboardCard({
  label,
  value,
  delta,
  tone = "primary",
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "primary" | "memory" | "success";
}) {
  const config = toneConfig[tone] || toneConfig.primary;
  const Icon = label.includes("Customers") ? Users : config.icon;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-white p-5 shadow-xs transition-colors hover:border-slate-300",
        config.border,
      )}
    >
      {/* Clean top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", config.accent)} />

      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-500">{label}</p>
        <span className={cn("flex size-8 items-center justify-center rounded-xl", config.iconBg)}>
          <Icon className="size-4" />
        </span>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <p className="font-display text-3xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </p>
      </div>

      {delta ? (
        <div className="mt-2.5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-md border px-1.5 py-0.5 text-[11px] font-bold",
              config.badge,
            )}
          >
            <ArrowUpRight className="size-3" />
            {delta}
          </span>
          <span className="text-[11px] font-medium text-slate-400">trend</span>
        </div>
      ) : null}
    </div>
  );
}
