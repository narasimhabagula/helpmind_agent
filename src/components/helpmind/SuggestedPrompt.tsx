import { ArrowRight } from "lucide-react";

export function SuggestedPrompt({
  label,
  onSelect,
}: {
  label: string;
  onSelect: (label: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(label)}
      className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
    >
      <span>{label}</span>
      <ArrowRight className="size-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
    </button>
  );
}
