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
      <div className="relative size-9 shrink-0 overflow-hidden rounded-xl bg-slate-950 shadow-sm ring-2 ring-blue-500/30 transition-transform duration-200 group-hover:scale-105">
        <img
          src="/helpmind-logo.jpg"
          alt="HelpMind AI Brand Logo"
          className="size-full object-cover"
        />
      </div>
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
