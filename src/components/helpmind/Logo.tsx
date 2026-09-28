import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  subtitle = "Memory-powered AI Customer Support",
  showSubtitle = true,
}: {
  className?: string;
  subtitle?: string;
  showSubtitle?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3 group", className)}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm ring-2 ring-blue-100 transition-transform duration-200 group-hover:scale-105">
        <Brain className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 font-display text-[15px] leading-tight font-bold text-slate-900">
          HelpMind
          <span className="inline-block rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            AI
          </span>
        </span>
        {showSubtitle ? (
          <span className="block truncate text-xs leading-tight font-medium text-slate-500">
            {subtitle}
          </span>
        ) : null}
      </span>
    </div>
  );
}
