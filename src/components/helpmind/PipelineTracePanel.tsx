import {
  CheckCircle2,
  Loader2,
  Sparkles,
  Database,
  UserCheck,
  Brain,
  ArrowDown,
} from "lucide-react";
import type { PipelineTraceStep } from "@/server/services/support-agent";

export function PipelineTracePanel({
  trace = [],
  isLoading = false,
}: {
  trace?: PipelineTraceStep[];
  isLoading?: boolean;
}) {
  const defaultTrace: PipelineTraceStep[] = [
    {
      step: "Customer Message",
      detail: "Inquiry received by HelpMind API gateway",
      status: "completed",
      timestamp: "Ready",
    },
    {
      step: "Customer Identified",
      detail: "Verified customerId & loaded profile",
      status: "completed",
      timestamp: "Ready",
    },
    {
      step: "Hindsight Recall",
      detail: "Retrieved customer memories from bank 'supportmind'",
      status: "completed",
      timestamp: "Ready",
    },
    {
      step: "Gemini Reasoning",
      detail: "Synthesized context with Gemini 1.5 Flash",
      status: "completed",
      timestamp: "Ready",
    },
    {
      step: "Hindsight Retain",
      detail: "Completed interaction stored for future conversations",
      status: "completed",
      timestamp: "Ready",
    },
  ];

  const activeSteps = trace.length > 0 ? trace : defaultTrace;

  const getIcon = (stepName: string) => {
    const lower = stepName.toLowerCase();
    if (lower.includes("customer")) return <UserCheck className="size-3.5 text-blue-600" />;
    if (lower.includes("recall") || lower.includes("retain") || lower.includes("memory"))
      return <Database className="size-3.5 text-sky-600" />;
    if (lower.includes("gemini") || lower.includes("reasoning"))
      return <Sparkles className="size-3.5 text-blue-600" />;
    return <Brain className="size-3.5 text-blue-600" />;
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
            <Sparkles className="size-3.5" />
          </span>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              ⚡ AI Activity Trace
            </h3>
            <p className="text-[11px] text-slate-500">Live memory-grounded agent lifecycle</p>
          </div>
        </div>

        {isLoading ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
            <Loader2 className="size-3 animate-spin text-blue-600" />
            Executing
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Live Trace
          </span>
        )}
      </div>

      {/* Pipeline Steps Flow */}
      <ol className="relative space-y-3 pl-1">
        {activeSteps.map((step, idx) => {
          const isLast = idx === activeSteps.length - 1;

          return (
            <li key={step.step + idx} className="relative flex items-start gap-3">
              {/* Connector line */}
              {!isLast ? (
                <div className="absolute left-3.5 top-7 bottom-0 w-px bg-slate-200 -z-0" />
              ) : null}

              {/* Status Icon */}
              <span className="relative z-10 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 border border-slate-200 shadow-2xs">
                {step.status === "completed" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : step.status === "in_progress" ? (
                  <Loader2 className="size-3.5 animate-spin text-blue-600" />
                ) : (
                  getIcon(step.step)
                )}
              </span>

              {/* Step Content */}
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{step.step}</p>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0">
                    {step.timestamp}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{step.detail}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* Visual Pipeline Footer Flow */}
      <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-center text-[10px] font-medium text-slate-500">
        <span className="font-semibold text-slate-700">Architecture: </span>
        Customer Inquiry → Hindsight Retain → Hindsight Recall → Gemini Reasoning → Personalized
        Reply → Hindsight Retain
      </div>
    </div>
  );
}
