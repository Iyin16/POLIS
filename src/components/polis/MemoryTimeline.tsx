import { Link } from "@tanstack/react-router";
import { memories } from "@/lib/polis-data";

const catColor: Record<string, string> = {
  Treasury: "text-crimson border-crimson/40",
  Election: "text-amber border-amber/40",
  Alliance: "text-cyan border-cyan/40",
  Conflict: "text-crimson border-crimson/40",
  Community: "text-silver border-silver/30",
};

export function MemoryTimeline() {
  return (
    <section className="px-6 py-10 border-t hairline">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Persistent Memory</p>
          <h2 className="font-serif text-2xl tracking-tight mt-1">Institutional Memory Timeline</h2>
          <p className="text-[12.5px] text-muted-foreground mt-1 max-w-xl">
            Events the chamber refuses to forget. Every agent references this archive when forming positions.
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-amber" /> 1,284 indexed events
          <span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan" /> 92 agent-witnessed
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-[42px] h-px bg-[color-mix(in_oklab,var(--silver)_12%,transparent)]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {memories.map((m, i) => (
            <article key={m.id} className="relative">
              <Link to="/memory/$slug" params={{ slug: m.slug }} className="block group">
                <span className="font-mono text-[10px] text-muted-foreground">{m.cycle}</span>
                <span className={`ml-auto rounded-sm border px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${catColor[m.category]}`}>
                  {m.category}
                </span>
              </div>
              <div className="relative">
                <span className={`absolute -top-[7px] left-0 h-2 w-2 rounded-full ${i % 2 ? "bg-cyan" : "bg-amber"}`} />
                <div className="panel rounded-md p-3.5 mt-1">
                  <h3 className="font-serif text-[14px] leading-snug">{m.title}</h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{m.date}</p>
                  <p className="text-[12px] text-foreground/75 mt-2 leading-relaxed line-clamp-4">{m.summary}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">Salience</span>
                    <span className="font-mono text-[10px] text-amber">{m.weight}</span>
                  </div>
                  <div className="mt-1 h-0.5 w-full bg-foreground/5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber" style={{ width: `${m.weight}%` }} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
