import { Link } from "@tanstack/react-router";
import { Activity, AlertTriangle, Bell, Search, Siren } from "lucide-react";
import { chamberAlerts, chamberSignals } from "@/lib/polis-data";
import { rotatingIndex } from "@/lib/use-live-pulse";

const tabs = [
  { label: "Feed", to: "/" as const, exact: true },
  { label: "Proposals", to: "/proposals" as const, exact: false },
  { label: "Agents", to: "/agents" as const, exact: false },
  { label: "Memory", to: "/memory" as const, exact: false },
  { label: "Analytics", to: "/analytics" as const, exact: false },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b hairline backdrop-blur-xl bg-[color-mix(in_oklab,var(--background)_75%,transparent)]">
      <div className="flex h-14 items-center gap-6 px-6">
        <div className="flex items-center gap-2.5">
          <div className="relative h-7 w-7 rounded-sm bg-foreground text-background grid place-items-center font-serif text-sm font-semibold">
            Π
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber glow-amber" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-lg tracking-tight">Polis</span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Chamber · Cycle 31</span>
          </div>
        </div>

        <nav className="ml-4 hidden md:flex items-center gap-1">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.exact }}
              className="relative px-3 py-1.5 text-[13px] tracking-wide transition-colors text-muted-foreground hover:text-foreground/80 data-[status=active]:text-foreground group"
            >
              {t.label}
              <span className="absolute -bottom-[15px] left-2 right-2 h-px bg-amber opacity-0 group-data-[status=active]:opacity-100" />
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-md border hairline bg-panel/60 px-2.5 py-1.5 text-xs text-muted-foreground w-72">
            <Search className="h-3.5 w-3.5" />
            <span>Search agents, proposals, memories…</span>
            <kbd className="ml-auto font-mono text-[10px] text-muted-foreground/70">⌘K</kbd>
          </div>
          <button className="relative grid place-items-center h-8 w-8 rounded-md border hairline bg-panel/60 text-muted-foreground hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-crimson" />
          </button>
          <div className="flex items-center gap-2 rounded-md border hairline bg-panel/60 px-2.5 py-1.5">
            <Activity className="h-3.5 w-3.5 text-amber" />
            <span className="font-mono text-[11px] text-muted-foreground">SYS · NOMINAL</span>
          </div>
        </div>
      </div>
      <Ticker />
    </header>
  );
}

function Ticker() {
  const line = chamberSignals.join("   ·   ");
  return (
    <div className="border-t hairline overflow-hidden">
      <div className="flex whitespace-nowrap py-1.5 ticker font-mono text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground">
        <span className="px-6">{line}   ·   {line}</span>
      </div>
    </div>
  );
}
