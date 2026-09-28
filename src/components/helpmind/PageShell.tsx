import type { ReactNode } from "react";
import { Header } from "./Header";
import { useCustomerName } from "@/lib/use-customer-name";

export function PageShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const { name } = useCustomerName();

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-900">
      {/* Subtle single-hue ambient glow */}
      <div className="pointer-events-none fixed top-0 left-1/3 -z-10 size-96 rounded-full bg-blue-500/5 blur-3xl" />

      <Header customerName={name} />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          {description ? (
            <p className="mt-1.5 text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div>{children}</div>
      </main>
    </div>
  );
}
