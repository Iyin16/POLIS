import { Link } from "@tanstack/react-router";
import { proposals } from "@/lib/polis-data";
import { ArrowUpRight, ShieldAlert, TrendingUp } from "lucide-react";

const tagColor: Record<string, string> = {
  Active: "text-amber border-amber/40 bg-amber/5",
  Passed: "text-cyan border-cyan/40 bg-cyan/5",
  Rejected: "text-crimson border-crimson/40 bg-crimson/5",
  Tabled: "text-silver border-silver/30 bg-silver/5",
};

const riskColor: Record<string, string> = {
  Low: "text-cyan",
  Moderate: "text-amber",
  Elevated: "text-amber",
  Critical: "text-crimson",
};

export function ProposalPanel() {
  return (
    <section className="px-6 py-8 max-w-6xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Governance</p>
          <h1 className="font-serif text-2xl tracking-tight mt-1">Active DAO Proposals</h1>
          <p className="text-[12.5px] text-muted-foreground mt-1 max-w-xl">
            Live deliberations, voting distribution, sentiment trends, and treasury impact across the chamber floor.
          </p>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">{proposals.length} on record</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {proposals.map((p) => (
          <Link
            key={p.id}
            to="/proposals/$slug"
            params={{ slug: p.slug }}
            className="panel rounded-md p-4 hover:border-[color-mix(in_oklab,var(--silver)_22%,transparent)] transition-colors group block"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.2em] text-amber">{p.id}</span>
              <span className={`rounded-sm border px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${tagColor[p.statusTag]}`}>
                {p.statusTag}
              </span>
            </div>
            <h2 className="font-serif text-[16px] leading-snug mt-2">{p.title}</h2>
            <p className="font-mono text-[10.5px] text-muted-foreground mt-1">{p.status}</p>
            <p className="mt-3 text-[12.5px] text-foreground/75 leading-relaxed line-clamp-3">{p.summary}</p>

            <div className="mt-4 grid grid-cols-3 gap-2 text-[10.5px]">
              <Stat label="Endorse" value={`${p.votes.for}%`} accent="amber" />
              <Stat label="Oppose" value={`${p.votes.against}%`} accent="crimson" />
              <Stat label="Abstain" value={`${p.votes.abstain}%`} accent="silver" />
            </div>

            <div className="mt-3 flex items-center justify-between font-mono text-[10px]">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <ShieldAlert className={`h-3 w-3 ${riskColor[p.riskLevel]}`} />
                Risk · <span className={riskColor[p.riskLevel]}>{p.riskLevel}</span>
              </span>
              <span className="flex items-center gap-1 text-amber">
                <TrendingUp className="h-3 w-3" /> {p.sentimentDelta}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground group-hover:text-foreground">
                Open <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "amber" | "crimson" | "silver" }) {
  const c = accent === "amber" ? "text-amber" : accent === "crimson" ? "text-crimson" : "text-silver";
  return (
    <div className="rounded-sm border hairline bg-background/40 px-2 py-1.5">
      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-serif text-[13px] mt-0.5 ${c}`}>{value}</div>
    </div>
  );
}
