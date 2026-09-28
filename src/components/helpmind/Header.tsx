import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronDown, LogOut, Menu, Plus, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { clearCustomerName } from "@/lib/use-customer-name";
import { Logo } from "./Logo";
import { SettingsModal } from "./SettingsModal";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/chat", label: "Support Chat" },
  { to: "/customers", label: "Customers" },
  { to: "/history", label: "Conversation History" },
  { to: "/memory", label: "Memory Explorer" },
  { to: "/dashboard", label: "AI Activity" },
] as const;

function getInitials(name?: string) {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0];
  const second = parts[1];
  if (first && second && first[0] && second[0]) {
    return `${first[0]}${second[0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function Header({
  customerName,
  customerId,
  onNewChat,
  onSwitchCustomer,
}: {
  customerName?: string;
  customerId?: string;
  onNewChat?: () => void;
  onSwitchCustomer?: (name: string, customerId: string) => void;
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<
    "connected" | "offline" | "not_configured" | "checking"
  >("checking");
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    fetch("/api/health")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted) return;
        if (data?.hindsight === "connected") {
          setHealthStatus("connected");
        } else if (data?.hindsight === "offline") {
          setHealthStatus("offline");
        } else if (data?.hindsight === "not_configured") {
          setHealthStatus("not_configured");
        } else {
          setHealthStatus("offline");
        }
      })
      .catch(() => {
        if (mounted) setHealthStatus("offline");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearCustomerName();
    setUserMenuOpen(false);
    navigate({ to: "/" });
  };

  const handleSelectCustomer = (name: string, id: string) => {
    setUserMenuOpen(false);
    setOpen(false);
    if (onSwitchCustomer) {
      onSwitchCustomer(name, id);
    } else {
      window.localStorage.setItem("helpmind:customer-name", name);
      window.localStorage.setItem("helpmind:customer-id", id);
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Clean Electric Blue top border */}
      <div className="h-0.5 w-full bg-blue-600" />

      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center gap-3 px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-slate-700 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="flex flex-col w-[290px] p-0 border-r border-slate-200"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="border-b border-slate-200 p-5">
              <Logo />
            </div>
            <nav className="flex flex-col gap-1.5 p-4">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  activeProps={{
                    className: "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200",
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 p-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <Avatar className="size-10 ring-2 ring-blue-100">
                  <AvatarFallback className="bg-blue-600 text-xs font-bold text-white">
                    {getInitials(customerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {customerName || "Customer"}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active session
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                >
                  <Settings className="size-3.5 text-slate-500" />
                  <span>Settings</span>
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Customer
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCustomer("Priya Sharma", "CUST-1024")}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>Priya Sharma</span>
                  <span className="text-[10px] text-slate-400 font-mono">CUST-1024</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCustomer("Rahul Sharma", "CUST-2048")}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>Rahul Sharma</span>
                  <span className="text-[10px] text-slate-400 font-mono">CUST-2048</span>
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="mt-3.5 w-full justify-center gap-2 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-slate-200"
              >
                <LogOut className="size-3.5" />
                Log out
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link to="/chat" className="shrink-0 transition-opacity hover:opacity-90">
          <Logo subtitle="AI Customer Support Agent" />
        </Link>

        <nav className="ml-6 hidden items-center gap-1.5 lg:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              activeProps={{
                className: "bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-200",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-2.5">
          {/* Dynamic Health Status Indicator */}
          {healthStatus === "connected" ? (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700"
              title="Backend connected and Hindsight memory active"
            >
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              ● AI Online
            </span>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800"
              title="Fallback agent active (Hindsight memory offline)"
            >
              <span className="relative flex size-2">
                <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
              </span>
              ● Memory Offline
            </span>
          )}

          {onNewChat ? (
            <Button
              size="sm"
              variant="outline"
              onClick={onNewChat}
              className="h-8 gap-1.5 rounded-lg border-blue-200 bg-white text-xs font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Plus className="size-3.5 text-blue-600" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          ) : null}

          {/* User profile dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 cursor-pointer shadow-2xs"
            >
              <Avatar className="size-6 text-[10px]">
                <AvatarFallback className="bg-blue-600 font-bold text-white">
                  {getInitials(customerName)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="max-w-[120px] truncate text-slate-900 font-bold text-xs">
                  {customerName || "Customer"}
                </span>
                <span className="text-[10px] font-mono font-semibold text-blue-700">
                  {customerId || "CUST-1024"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "size-3 text-slate-400 transition-transform duration-200 ml-0.5",
                  userMenuOpen && "rotate-180 text-blue-600",
                )}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-slate-200 bg-white p-1.5 text-slate-900 shadow-lg z-50 animate-in fade-in-0 zoom-in-95">
                <div className="px-3 py-2 bg-slate-50 rounded-lg">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {customerName || "Customer"}
                  </p>
                  <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1 mt-0.5">
                    <span className="size-1.5 rounded-full bg-emerald-500 inline-block" />
                    Active Customer Session
                  </p>
                </div>

                <div className="my-1.5 h-px bg-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  <Settings className="size-3.5 text-slate-500" />
                  <span>Settings</span>
                </button>

                <div className="my-1.5 h-px bg-slate-100" />
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Demo Customer
                </p>
                <button
                  type="button"
                  onClick={() => handleSelectCustomer("Priya Sharma", "CUST-1024")}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50 hover:text-blue-700",
                    customerName?.toLowerCase().includes("priya")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="size-3 text-blue-600" />
                    Priya Sharma
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">CUST-1024</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectCustomer("Rahul Sharma", "CUST-2048")}
                  className={cn(
                    "flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50 hover:text-blue-700",
                    customerName?.toLowerCase().includes("rahul")
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-slate-700",
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    <User className="size-3 text-sky-600" />
                    Rahul Sharma
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">CUST-2048</span>
                </button>

                <div className="my-1.5 h-px bg-slate-100" />
                {onNewChat ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onNewChat();
                    }}
                    className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-700"
                  >
                    <Plus className="size-3.5 text-blue-600" />
                    New Chat Session
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  <LogOut className="size-3.5" />
                  Log out
                </button>
              </div>
            )}
          </div>

          {/* Direct Log out button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 gap-1.5 px-2 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 sm:px-2.5 transition-colors"
            title="Log out of session"
          >
            <LogOut className="size-3.5" />
            <span className="hidden md:inline">Log out</span>
          </Button>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        customerName={customerName}
        customerId={customerId}
        onLogout={handleLogout}
      />
    </header>
  );
}
