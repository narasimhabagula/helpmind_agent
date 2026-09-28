import { useEffect, useRef } from "react";
import {
  MessageSquareText,
  Sparkles,
  Loader2,
  PackageSearch,
  MapPin,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import type { ChatMessageItem } from "@/lib/demo-data";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import { useAppSettings } from "@/lib/use-app-settings";

const suggestedActions = [
  { label: "Track an order", icon: PackageSearch, prompt: "My order has not arrived yet." },
  {
    label: "Change shipping address",
    icon: MapPin,
    prompt: "I want to change my shipping address.",
  },
  {
    label: "Request a refund",
    icon: RefreshCw,
    prompt: "I would like to request a refund for an order.",
  },
  {
    label: "Contact support",
    icon: HelpCircle,
    prompt: "I need help with my account and recent billing.",
  },
];

export function SupportChat({
  messages,
  name,
  notice,
  isLoading = false,
  onSend,
}: {
  messages: ChatMessageItem[];
  name: string;
  notice?: string | null;
  isLoading?: boolean;
  onSend: (text: string) => void;
}) {
  const endRef = useRef<HTMLDivElement>(null);
  const firstName = name.split(" ")[0] || "there";
  const { settings } = useAppSettings();

  useEffect(() => {
    if (settings.autoScroll) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, isLoading, settings.autoScroll]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/60 px-5 py-3.5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <MessageSquareText className="size-4" />
          </span>
          <div>
            <h1 className="font-display text-sm font-bold text-slate-900 flex items-center gap-2">
              Support Chat
              <span className="hidden sm:inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Live Agent
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              HelpMind intelligent assistance with long-term memory recall
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Connected
          </span>
        </div>
      </div>

      {/* Messages viewport */}
      <div className="scroll-slim min-h-0 flex-1 space-y-5 overflow-y-auto bg-slate-50/40 px-4 py-5 sm:px-6">
        {notice ? (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-xs font-semibold text-blue-900 shadow-2xs">
            {notice}
          </div>
        ) : null}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm ring-4 ring-blue-50">
              <MessageSquareText className="size-7" />
            </span>

            <h2 className="mt-5 font-display text-2xl font-bold text-slate-900">
              How can I help you today, {firstName}?
            </h2>
            <p className="mt-2 max-w-md text-xs sm:text-sm text-slate-500 leading-relaxed">
              Describe your issue or request below. I remember previous interactions, preferences,
              and details across sessions.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5 max-w-lg">
              {suggestedActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onSend(action.prompt)}
                    className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition-colors hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
                  >
                    <Icon className="size-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span>{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((message) => <ChatMessage key={message.id} message={message} name={name} />)
        )}

        {/* Loading / Generating State */}
        {isLoading && (
          <div className="flex items-center gap-3 animate-in fade-in">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sparkles className="size-4 animate-spin" />
            </span>
            <div className="rounded-2xl rounded-tl-xs border border-slate-200 bg-white px-4 py-3 text-xs font-medium text-slate-500 flex items-center gap-2 shadow-xs">
              <Loader2 className="size-3.5 animate-spin text-blue-600" />
              HelpMind AI is thinking & recalling memory...
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <ChatComposer onSend={onSend} disabled={isLoading} />
    </section>
  );
}
