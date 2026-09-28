import { Mail, MapPin, UserCheck, ShieldCheck } from "lucide-react";
import { useCustomerName } from "@/lib/use-customer-name";

export function CustomerProfile({
  name,
  customerId: propId,
}: {
  name?: string | undefined;
  customerId?: string | undefined;
}) {
  const { name: contextName, customerId: contextId } = useCustomerName();
  const displayName = name || contextName || "Customer";

  const activeId =
    propId ||
    contextId ||
    (displayName.toLowerCase().includes("priya")
      ? "CUST-1024"
      : displayName.toLowerCase().includes("rahul")
        ? "CUST-2048"
        : "CUST-1001");

  const initials =
    displayName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "C";

  const isPriya = activeId === "CUST-1024" || displayName.toLowerCase().includes("priya");
  const isRahul = activeId === "CUST-2048" || displayName.toLowerCase().includes("rahul");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-600 font-display text-sm font-bold text-white ring-2 ring-blue-50">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">{displayName}</p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600">
              <UserCheck className="size-3" />
              {activeId}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
          Active Session
        </span>
      </div>

      <dl className="mt-3.5 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-slate-600">
          <span className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <MapPin className="size-3.5" />
          </span>
          <dt className="sr-only">Location</dt>
          <dd className="font-medium text-slate-700">
            {isPriya ? "Hyderabad, India" : isRahul ? "Mumbai, India" : "Authenticated Location"}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <Mail className="size-3.5" />
          </span>
          <dt className="sr-only">Communication Channel</dt>
          <dd className="font-medium text-slate-700">
            {isPriya
              ? "Prefers Email updates"
              : isRahul
                ? "Prefers Phone updates"
                : "Realtime Memory Synchronization"}
          </dd>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="flex size-6 items-center justify-center rounded-md bg-slate-100 text-slate-600">
            <ShieldCheck className="size-3.5" />
          </span>
          <dt className="sr-only">Security Status</dt>
          <dd className="font-medium text-slate-700">Strict Memory Isolation Scoped</dd>
        </div>
      </dl>
    </section>
  );
}
