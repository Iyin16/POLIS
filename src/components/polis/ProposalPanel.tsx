import { proposal } from "@/lib/polis-data";
import { ShieldAlert, TrendingDown, TrendingUp } from "lucide-react";

export function ProposalPanel() {
  const { votes, sentimentTrend, risk } = proposal;
  return (
    <section className="px-6 py-8 max-w-5xl">
      <div className="mb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Governance</p>
        <h1 className="font-serif text-2xl tracking-tight mt-1">Active DAO Proposals</h1>
        <p className="text-[12.5px] text-muted-foreground mt-1 max-w-xl">
          Live deliberations, voting distribution, sentiment trends, and treasury impact across the chamber floor.
        </p>
      </div>

      <Header />

      <article className="panel rounded-md overflow-hidden">
        <div className="px-4 pt-4 pb-3 border-b hairline">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.2em] text-amber">{proposal.id}</span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-amber pulse-dot text-amber" />
              ACTIVE
            </span>
          </div>
          <h2 className="font-serif text-[17px] leading-snug mt-2">{proposal.title}</h2>
          <p className="font-mono text-[10.5px] text-muted-foreground mt-1.5">{proposal.status}</p>
        </div>

        <div className="px-4 py-3 border-b hairline">
          <p className="text-[12.5px] leading-relaxed text-foreground/80">{proposal.summary}</p>
        </div>

        <div className="px-4 py-4 border-b hairline">
          <SectionLabel>Voting Distribution</SectionLabel>
          <div className="mt-2 space-y-2">
            <VoteBar label="Endorse" value={votes.for} color="bg-amber" />
            <VoteBar label="Oppose" value={votes.against} color="bg-crimson" />
            <VoteBar label="Abstain" value={votes.abstain} color="bg-silver" />
          </div>
        </div>

        <div className="px-4 py-4 border-b hairline">
          <div className="flex items-center justify-between">
            <SectionLabel>Sentiment Trend · 12h</SectionLabel>
            <span className="flex items-center gap-1 font-mono text-[10.5px] text-amber">
              <TrendingUp className="h-3 w-3" /> +12.4
            </span>
          </div>
          <Sparkline data={sentimentTrend} />
        </div>

        <div className="px-4 py-4 border-b hairline grid grid-cols-2 gap-3">
          <Metric
            icon={<TrendingDown className="h-3.5 w-3.5 text-crimson" />}
            label="Treasury Impact"
            value={proposal.treasuryImpact}
          />
          <Metric
            icon={<ShieldAlert className="h-3.5 w-3.5 text-amber" />}
            label="Risk Index"
            value={`${risk} / 100`}
          />
        </div>

        <div className="px-4 py-4">
          <SectionLabel>Governance Risk Meter</SectionLabel>
          <RiskMeter value={risk} />
          <div className="mt-2 flex justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Stable</span><span>Watch</span><span className="text-crimson">Critical</span>
          </div>
        </div>

        <div className="border-t hairline px-4 py-3 flex gap-2">
          <button className="flex-1 rounded-sm bg-foreground text-background py-2 text-[12px] font-medium tracking-wide hover:opacity-90">
            Review & Vote
          </button>
          <button className="rounded-sm border hairline px-3 py-2 text-[12px] text-muted-foreground hover:text-foreground">
            Delegate
          </button>
        </div>
      </article>

      <Header label="Upcoming on the Floor" />
      <div className="panel rounded-md divide-y hairline">
        {[
          { id: "POL-251", title: "Delegation Weight Reform Act", time: "in 2d 14h", tone: "amber" },
          { id: "POL-253", title: "Bridge Sovereignty Charter", time: "in 4d 02h", tone: "cyan" },
          { id: "POL-256", title: "Censure of Validator Set V-19", time: "in 6d 11h", tone: "crimson" },
        ].map((p) => (
          <div key={p.id} className="px-3 py-2.5 flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${p.tone === "amber" ? "bg-amber" : p.tone === "cyan" ? "bg-cyan" : "bg-crimson"}`} />
            <span className="font-mono text-[10px] text-muted-foreground">{p.id}</span>
            <span className="text-[12px] truncate">{p.title}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">{p.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Header({ label = "Active Proposal" }: { label?: string }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</h2>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground">{children}</p>;
}

function VoteBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-foreground/80">{label}</span>
        <span className="font-mono text-muted-foreground">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-foreground/5 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 280, h = 56;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 w-full h-14">
      <defs>
        <linearGradient id="sg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,${h} ${pts} ${w},${h}`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke="var(--amber)" strokeWidth="1.5" />
    </svg>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-sm border hairline bg-background/30 p-2.5">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 font-serif text-[13px]">{value}</p>
    </div>
  );
}

function RiskMeter({ value }: { value: number }) {
  return (
    <div className="mt-2 relative h-2 w-full rounded-full overflow-hidden bg-foreground/5">
      <div className="absolute inset-0 bg-gradient-to-r from-amber via-amber to-crimson opacity-90" style={{ width: `${value}%` }} />
      <div className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-foreground" style={{ left: `${value}%` }} />
    </div>
  );
}
