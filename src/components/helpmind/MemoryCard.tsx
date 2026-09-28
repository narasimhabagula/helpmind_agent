import { CalendarDays, FileText } from "lucide-react";
import type { MemoryItem } from "@/lib/demo-data";

export function MemoryCard({ memory }: { memory: MemoryItem }) {
  return (
    <article className="group relative rounded-xl border border-slate-200 border-l-4 border-l-sky-500 bg-white p-4 transition-colors shadow-2xs hover:border-slate-300">
      <div className="flex items-start gap-3">
        {/* Unified Sky Cyan Index Badge */}
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-600 font-display text-xs font-bold text-white shadow-2xs">
          {memory.index}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              {memory.title}
            </h4>
            <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-bold tracking-wide text-sky-800 uppercase">
              {memory.category}
            </span>
          </div>

          <p className="mt-1.5 text-xs sm:text-[13px] leading-relaxed text-slate-600">
            {memory.text}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 border-t border-slate-100 pt-2.5">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <CalendarDays className="size-3 text-slate-400" />
              {memory.date}
            </span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <FileText className="size-3 text-sky-600" />
              {memory.source}
            </span>
            <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Used {memory.lastUsed}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
