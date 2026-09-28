import { ArrowDown, Brain, Database, MessageSquare, Sparkles, CheckCircle2 } from "lucide-react";

const flowSteps = [
  {
    title: "Customer Message",
    desc: "Inquiry received & customer identity verified",
    icon: MessageSquare,
  },
  {
    title: "Hindsight Memory",
    desc: "Recalls isolated customer facts & past issues",
    icon: Database,
  },
  {
    title: "Gemini AI",
    desc: "Reasons over retrieved context without hallucination",
    icon: Sparkles,
  },
  {
    title: "Personalized Response",
    desc: "Generates grounded support reply to customer",
    icon: CheckCircle2,
  },
  {
    title: "New Memory",
    desc: "Retains new interaction in Hindsight for future recall",
    icon: Brain,
  },
];

export function MemoryFlow() {
  return (
    <div className="rounded-2xl border border-sky-200 bg-sky-50/50 p-4">
      <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-sky-950">
          <Brain className="size-3.5 text-sky-600" />
          Execution Architecture
        </p>
        <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold text-sky-800">
          Hindsight + Gemini
        </span>
      </div>

      <div className="mt-3 space-y-1.5">
        {flowSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={step.title}>
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-2 bg-white shadow-2xs">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Icon className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight">{step.title}</p>
                  <p className="text-[10px] text-slate-500 truncate">{step.desc}</p>
                </div>
              </div>

              {i < flowSteps.length - 1 ? (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3 text-sky-500" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
