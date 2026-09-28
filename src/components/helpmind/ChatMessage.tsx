import { Brain, Sparkles, User, CheckCircle2, Clock } from "lucide-react";
import type { ChatMessageItem } from "@/lib/demo-data";
import { useAppSettings } from "@/lib/use-app-settings";

export function ChatMessage({ message, name }: { message: ChatMessageItem; name: string }) {
  const { settings } = useAppSettings();
  const timeDisplay = message.timestamp || "Just now";

  if (message.role === "customer") {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="flex justify-end items-end gap-2.5">
          <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-blue-600 px-4 py-3 text-sm leading-relaxed font-medium text-white shadow-xs sm:max-w-[72%]">
            {message.text}
          </div>
          <span className="hidden sm:flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <User className="size-3.5" />
          </span>
        </div>
        {settings.showTimestamps && (
          <span className="text-[10px] text-slate-400 font-medium mr-9 flex items-center gap-1">
            <Clock className="size-2.5" />
            {timeDisplay}
          </span>
        )}
      </div>
    );
  }

  const firstName = name.split(" ")[0] || "";
  const greeting =
    message.greeting && firstName ? message.greeting.replace("Priya", firstName) : message.greeting;

  return (
    <div className="flex items-start gap-3">
      {/* Clean AI Avatar in Electric Blue */}
      <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
        <Sparkles className="size-4" />
      </span>

      <div className="min-w-0 flex-1 space-y-2.5">
        {/* Memory Recall Badge (Sky Cyan) */}
        {message.memoryUsed ? (
          <div className="inline-flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-1.5 shadow-2xs">
            <span className="flex size-5 items-center justify-center rounded-lg bg-sky-600 text-white">
              <Brain className="size-3" />
            </span>
            <span className="text-xs font-bold text-sky-950">{message.memoryUsed.label}:</span>
            <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-sky-800 border border-sky-200">
              {message.memoryUsed.detail}
            </span>
          </div>
        ) : null}

        {/* AI Response Card */}
        <div className="rounded-2xl rounded-tl-xs border border-slate-200 border-l-4 border-l-blue-600 bg-white px-5 py-4 text-sm leading-relaxed text-slate-900 shadow-xs">
          {message.text ? <p className="font-medium">{message.text}</p> : null}
          {greeting ? <p className="font-bold text-base text-slate-900">{greeting}</p> : null}
          {message.intro ? (
            <p className="mt-2 text-slate-600 leading-relaxed">{message.intro}</p>
          ) : null}

          {message.list ? (
            <div className="mt-3.5 rounded-xl bg-slate-50 p-3.5 border border-slate-200">
              {message.listTitle ? (
                <p className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-blue-600" />
                  {message.listTitle}
                </p>
              ) : null}
              <ol className="mt-2.5 space-y-2">
                {message.list.map((item, i) => (
                  <li key={item} className="flex items-center gap-2.5">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-blue-600 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-[13px] font-medium text-slate-700">{item}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}

          {message.outro?.map((line) => (
            <p key={line} className="mt-3 text-slate-600 leading-relaxed">
              {line}
            </p>
          ))}

          {message.signature ? (
            <div className="mt-4 border-t border-slate-100 pt-3 text-[13px] text-slate-500">
              {message.signature.map((line) => (
                <p
                  key={line}
                  className="font-medium text-slate-700 first:font-normal first:text-slate-500"
                >
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {settings.showTimestamps && (
            <div className="mt-3 flex items-center justify-end">
              <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Clock className="size-2.5" />
                {timeDisplay}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
