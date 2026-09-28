import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Brain, Zap, ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { storeCustomerName } from "@/lib/use-customer-name";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HelpMind AI — Support that remembers" },
      {
        name: "description",
        content:
          "HelpMind AI is memory-powered customer support that remembers previous interactions and personalizes every reply.",
      },
      { property: "og:title", content: "HelpMind AI — Support that remembers" },
      {
        property: "og:description",
        content:
          "Memory-powered AI customer support: recall past interactions and resolve issues faster.",
      },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const start = () => {
    const finalName = name.trim() || "Customer";
    storeCustomerName(finalName);
    navigate({ to: "/chat" });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 px-4 py-12">
      {/* Subtle single-tone ambient glow */}
      <div className="pointer-events-none absolute -top-40 -left-40 size-96 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative w-full max-w-lg">
        <div className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          {/* Clean Electric Blue top border line */}
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-blue-600" />

          <div className="flex flex-col items-center text-center">
            {/* Clean badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <span>Intelligent Memory Support</span>
            </div>

            {/* Solid Electric Blue Brain Icon */}
            <div className="relative">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-50">
                <Brain className="size-7" />
              </span>
            </div>

            <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              HelpMind <span className="text-blue-600">AI</span>
            </h1>
            <p className="mt-2 text-sm font-semibold text-sky-700">AI Customer Support Agent</p>
            <p className="mt-2.5 text-sm leading-relaxed text-slate-500 max-w-sm">
              Customer support with dynamic memory. Every interaction, preference, and update is
              preserved across sessions.
            </p>

            {/* Value pillars */}
            <div className="mt-6 grid grid-cols-3 gap-2.5 w-full">
              <div className="flex flex-col items-center rounded-xl bg-sky-50 border border-sky-100 p-2.5 text-center">
                <Zap className="size-4 text-sky-600 mb-1" />
                <span className="text-[11px] font-bold text-sky-900">Instant Recall</span>
                <span className="text-[10px] text-sky-700">Zero repeating</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-center">
                <History className="size-4 text-blue-600 mb-1" />
                <span className="text-[11px] font-bold text-blue-900">Live Context</span>
                <span className="text-[10px] text-blue-700">Multi-turn</span>
              </div>
              <div className="flex flex-col items-center rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-center">
                <ShieldCheck className="size-4 text-slate-600 mb-1" />
                <span className="text-[11px] font-bold text-slate-900">Enterprise</span>
                <span className="text-[10px] text-slate-500">Secure</span>
              </div>
            </div>
          </div>

          <form
            className="mt-8 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-semibold text-slate-700">
                Enter your name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Narasimha"
                className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm font-medium transition-colors focus-visible:border-blue-600 focus-visible:ring-blue-600"
              />
            </div>

            <Button
              type="submit"
              className="h-12 w-full gap-2 rounded-xl bg-blue-600 font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 cursor-pointer"
            >
              Start Chat
              <ArrowRight className="size-4" />
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-slate-400">
            HelpMind Contextual Memory Architecture
          </p>
        </div>
      </div>
    </div>
  );
}
