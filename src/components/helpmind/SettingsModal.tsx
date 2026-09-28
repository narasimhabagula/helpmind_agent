import {
  Sun,
  Moon,
  Monitor,
  Sliders,
  RotateCcw,
  MessageSquare,
  UserCheck,
  ShieldCheck,
  LogOut,
  Check,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAppSettings, type AppTheme } from "@/lib/use-app-settings";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName?: string | undefined;
  customerId?: string | undefined;
  onLogout?: (() => void) | undefined;
}

export function SettingsModal({
  open,
  onOpenChange,
  customerName = "Priya Sharma",
  customerId = "CUST-1024",
  onLogout,
}: SettingsModalProps) {
  const { settings, updateSettings, resetDisplay } = useAppSettings();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const themeOptions: {
    id: AppTheme;
    label: string;
    description: string;
    icon: typeof Sun;
  }[] = [
    {
      id: "light",
      label: "Light",
      description: "Clean SaaS aesthetic",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark",
      description: "High contrast dark mode",
      icon: Moon,
    },
    {
      id: "system",
      label: "System",
      description: "Match OS preferences",
      icon: Monitor,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 sm:rounded-2xl border-slate-200 bg-white shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="border-b border-slate-100 bg-slate-50/70 p-5 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <Sliders className="size-5" />
            </span>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                Settings
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  HelpMind AI
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Customize appearance, display brightness, chat behaviors, and account details.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-5 sm:p-6">
          {/* 1. APPEARANCE */}
          <section className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Appearance
              </h3>
              <p className="text-sm font-semibold text-slate-800">Theme Mode</p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {themeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = settings.theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateSettings({ theme: opt.id })}
                    className={cn(
                      "relative flex flex-col items-start rounded-xl border p-3.5 text-left transition-all cursor-pointer",
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60",
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 flex size-4 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check className="size-2.5" />
                      </span>
                    )}
                    <span
                      className={cn(
                        "flex size-8 items-center justify-center rounded-lg transition-colors",
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="mt-2.5 text-xs font-bold text-slate-900">{opt.label}</span>
                    <span className="text-[11px] text-slate-500">{opt.description}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 2. DISPLAY & BRIGHTNESS */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  2. Display
                </h3>
                <p className="text-sm font-semibold text-slate-800">Application UI Brightness</p>
                <p className="text-xs text-slate-500">
                  Adjusts the in-app visual brightness (50% – 100%). Leaves your monitor hardware
                  settings untouched.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-blue-50 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 border border-blue-200">
                  {settings.brightness}%
                </span>
                {settings.brightness !== 100 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetDisplay}
                    className="h-7 gap-1 px-2 text-xs text-slate-500 hover:text-blue-600"
                    title="Reset to 100%"
                  >
                    <RotateCcw className="size-3" />
                    Reset
                  </Button>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <div className="flex items-center gap-4">
                <Sun className="size-4 text-slate-400 shrink-0" />
                <Slider
                  min={50}
                  max={100}
                  step={1}
                  value={[settings.brightness]}
                  onValueChange={(val) => {
                    const b = val[0];
                    if (typeof b === "number") {
                      updateSettings({ brightness: b });
                    }
                  }}
                  className="flex-1 cursor-pointer"
                />
                <Sun className="size-5 text-amber-500 shrink-0" />
              </div>
              <div className="mt-2.5 flex justify-between text-[11px] font-medium text-slate-400">
                <span>50% (Comfort Dim)</span>
                <span>75% (Balanced)</span>
                <span>100% (Full Brightness)</span>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 3. CHAT PREFERENCES */}
          <section className="space-y-3.5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                3. Chat Preferences
              </h3>
              <p className="text-sm font-semibold text-slate-800">
                Behavior & Interaction Controls
              </p>
            </div>

            <div className="space-y-2.5 rounded-xl border border-slate-200 divide-y divide-slate-100 bg-white">
              {/* Enter to Send */}
              <div className="flex items-center justify-between p-3.5">
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-900">Enter key sends message</p>
                  <p className="text-xs text-slate-500">
                    When enabled, pressing{" "}
                    <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 border border-slate-200">
                      Enter
                    </kbd>{" "}
                    submits. Use{" "}
                    <kbd className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-700 border border-slate-200">
                      Shift + Enter
                    </kbd>{" "}
                    for a new line.
                  </p>
                </div>
                <Switch
                  checked={settings.enterToSend}
                  onCheckedChange={(val) => updateSettings({ enterToSend: val })}
                  aria-label="Toggle Enter to send"
                />
              </div>

              {/* Show message timestamps */}
              <div className="flex items-center justify-between p-3.5">
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-900">Show message timestamps</p>
                  <p className="text-xs text-slate-500">
                    Display sent and received timestamps on individual conversation bubbles.
                  </p>
                </div>
                <Switch
                  checked={settings.showTimestamps}
                  onCheckedChange={(val) => updateSettings({ showTimestamps: val })}
                  aria-label="Toggle show timestamps"
                />
              </div>

              {/* Auto-scroll to latest message */}
              <div className="flex items-center justify-between p-3.5">
                <div className="pr-4">
                  <p className="text-xs font-bold text-slate-900">Auto-scroll to latest message</p>
                  <p className="text-xs text-slate-500">
                    Automatically smooth-scroll to newest messages as the AI agent replies.
                  </p>
                </div>
                <Switch
                  checked={settings.autoScroll}
                  onCheckedChange={(val) => updateSettings({ autoScroll: val })}
                  aria-label="Toggle auto scroll"
                />
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 4. ACCOUNT & SESSION */}
          <section className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                4. Customer Account
              </h3>
              <p className="text-sm font-semibold text-slate-800">Active Profile & Session</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-blue-200 shadow-2xs">
                    <AvatarFallback className="bg-blue-600 font-bold text-white text-xs">
                      {getInitials(customerName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-slate-900">{customerName}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Active Session
                      </span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-blue-700 mt-0.5">
                      Customer ID: {customerId}
                    </p>
                  </div>
                </div>

                {onLogout && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onOpenChange(false);
                      onLogout();
                    }}
                    className="gap-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200"
                  >
                    <LogOut className="size-3.5" />
                    Log out
                  </Button>
                )}
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-200/60 flex items-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="size-3.5 text-blue-600 shrink-0" />
                <span>
                  Enterprise Security: LLM and Hindsight memory API keys remain securely guarded on
                  the server.
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer */}
        <DialogFooter className="border-t border-slate-100 bg-slate-50/70 p-4 sm:px-6">
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 h-9"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
