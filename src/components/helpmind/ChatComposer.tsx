import { useState } from "react";
import { Mic, Paperclip, SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAppSettings } from "@/lib/use-app-settings";

export function ChatComposer({
  onSend,
  disabled = false,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");
  const { settings } = useAppSettings();

  const submit = () => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue("");
  };

  return (
    <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition-colors focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100">
        <Textarea
          value={value}
          disabled={disabled}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (settings.enterToSend) {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            } else {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                submit();
              }
            }
          }}
          placeholder={
            disabled ? "HelpMind AI is responding..." : "Type your message or issue details here..."
          }
          rows={2}
          className="min-h-[52px] resize-none border-0 bg-transparent p-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-none focus-visible:ring-0 disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-2 px-1 pt-1.5 border-t border-slate-200/60">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="size-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
              aria-label="Attach file"
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={disabled}
              className="size-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-40"
              aria-label="Voice message"
            >
              <Mic className="size-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 hidden sm:inline select-none">
              {settings.enterToSend ? "Enter ↵ to send" : "Ctrl + Enter ↵ to send"}
            </span>
            <Button
              type="button"
              onClick={submit}
              disabled={!value.trim() || disabled}
              className="h-9 gap-1.5 rounded-lg bg-blue-600 px-4 font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            >
              <span>Send</span>
              <SendHorizonal className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
