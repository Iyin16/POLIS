import { agents } from "@/lib/polis-data";
import { AgentAvatar } from "./AgentAvatar";

export function PersonaPanel() {
  return (
    <aside className="hidden lg:flex flex-col gap-3 w-[300px] shrink-0 px-4 py-5 border-r hairline overflow-y-auto max-h-[calc(100vh-90px)] sticky top-[90px]">
      <SectionHeader label="Active Personas" count={agents.length} />
      <div className="flex flex-col gap-2">
        {agents.map((a) => (
          <article
            key={a.id}
            className="panel rounded-md p-3 hover:border-[color-mix(in_oklab,var(--silver)_22%,transparent)] transition-colors group"
          >
            <div className="flex items-start gap-3">
              <AgentAvatar agent={a} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-serif text-[14px] leading-tight truncate">{a.name}</h3>
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">{a.handle.replace("@", "")}</span>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{a.ideology}</p>

                <div className="mt-2 grid grid-cols-2 gap-1.5">
                  <Stat label="REP" value={a.reputation} accent="amber" />
                  <Stat label="INF" value={a.influence} accent="cyan" />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <FactionTag faction={a.faction} />
                  <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-muted-foreground">
                    {a.status}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap gap-1">
                  {a.traits.map((t) => (
                    <span
                      key={t}
                      className="rounded-sm border hairline px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      <SectionHeader label="Chamber Composition" />
      <div className="panel rounded-md p-3">
        <div className="flex h-1.5 w-full overflow-hidden rounded-sm">
          <span className="bg-amber" style={{ width: "31%" }} />
          <span className="bg-cyan" style={{ width: "24%" }} />
          <span className="bg-crimson" style={{ width: "19%" }} />
          <span className="bg-silver" style={{ width: "17%" }} />
          <span className="bg-muted-foreground/60" style={{ width: "9%" }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1 text-[10.5px] text-muted-foreground font-mono">
          <span><i className="inline-block h-1.5 w-1.5 mr-1.5 align-middle bg-amber rounded-sm" />Reformist 31</span>
          <span><i className="inline-block h-1.5 w-1.5 mr-1.5 align-middle bg-cyan rounded-sm" />Technocrat 24</span>
          <span><i className="inline-block h-1.5 w-1.5 mr-1.5 align-middle bg-crimson rounded-sm" />Sovereigntist 19</span>
          <span><i className="inline-block h-1.5 w-1.5 mr-1.5 align-middle bg-silver rounded-sm" />Populist 17</span>
          <span><i className="inline-block h-1.5 w-1.5 mr-1.5 align-middle bg-muted-foreground/60 rounded-sm" />Accel. 9</span>
        </div>
      </div>
    </aside>
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center justify-between mt-1 mb-0.5">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</h2>
      {count !== undefined && (
        <span className="font-mono text-[10px] text-muted-foreground">{count.toString().padStart(2, "0")}</span>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: "amber" | "cyan" }) {
  return (
    <div className="rounded-sm border hairline bg-background/40 px-2 py-1">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{label}</span>
        <span className={`font-mono text-[10.5px] ${accent === "amber" ? "text-amber" : "text-cyan"}`}>{value}</span>
      </div>
      <div className="mt-1 h-0.5 w-full bg-foreground/5 overflow-hidden rounded-full">
        <div
          className={`h-full ${accent === "amber" ? "bg-amber" : "bg-cyan"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function FactionTag({ faction }: { faction: string }) {
  const map: Record<string, string> = {
    Reformist: "text-amber",
    Technocrat: "text-cyan",
    Sovereigntist: "text-crimson",
    Populist: "text-silver",
    Accelerationist: "text-muted-foreground",
  };
  return (
    <span className={`font-serif text-[11px] italic ${map[faction] ?? "text-muted-foreground"}`}>
      {faction}
    </span>
  );
}
