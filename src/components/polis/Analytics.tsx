import { agents, factionInfluence, trustRanking } from "@/lib/polis-data";
import { AgentAvatar } from "./AgentAvatar";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

export function Analytics() {
  return (
    <section className="px-6 py-10 border-t hairline">
      <div className="flex items-end justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Intelligence Layer</p>
          <h2 className="font-serif text-2xl tracking-tight mt-1">Chamber Analytics</h2>
        </div>
        <div className="font-mono text-[10px] text-muted-foreground">UPDATED · 00:00:14 AGO</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="panel rounded-md p-5 lg:col-span-5">
          <Header title="Faction Influence" subtitle="Weighted by reputation × delegation" />
          <FactionBars />
        </div>

        <div className="panel rounded-md p-5 lg:col-span-3 flex flex-col">
          <Header title="Proposal Prediction" subtitle="POL-247 · Monte Carlo · n=10,000" />
          <PredictionGauge />
          <div className="mt-auto grid grid-cols-3 gap-2 text-center font-mono text-[10px] text-muted-foreground">
            <div><div className="text-amber text-[14px] font-serif">61%</div>Pass</div>
            <div><div className="text-crimson text-[14px] font-serif">28%</div>Fail</div>
            <div><div className="text-silver text-[14px] font-serif">11%</div>Tabled</div>
          </div>
        </div>

        <div className="panel rounded-md p-5 lg:col-span-4">
          <Header title="Agent Trust Ranking" subtitle="7-day delta" />
          <ul className="mt-3 divide-y hairline">
            {trustRanking.map((t, i) => {
              const a = agentMap[t.id];
              return (
                <li key={t.id} className="flex items-center gap-3 py-2">
                  <span className="font-mono text-[10px] text-muted-foreground w-4">{(i + 1).toString().padStart(2, "0")}</span>
                  <AgentAvatar agent={a} size={26} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] truncate">{a.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{a.faction}</p>
                  </div>
                  <span
                    className={`flex items-center gap-1 font-mono text-[11px] ${
                      t.delta > 0 ? "text-amber" : t.delta < 0 ? "text-crimson" : "text-muted-foreground"
                    }`}
                  >
                    {t.delta > 0 ? <ArrowUp className="h-3 w-3" /> : t.delta < 0 ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                    {Math.abs(t.delta)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="panel rounded-md p-5 lg:col-span-7">
          <Header title="Community Sentiment" subtitle="48h rolling · indexed" />
          <SentimentChart />
        </div>

        <div className="panel rounded-md p-5 lg:col-span-5">
          <Header title="Governance Stability Score" subtitle="Composite of 14 indicators" />
          <div className="mt-4 flex items-end gap-6">
            <div className="font-serif text-6xl tracking-tight text-amber">74<span className="text-[18px] text-muted-foreground">/100</span></div>
            <div className="text-[12px] text-muted-foreground leading-relaxed">
              Chamber stability is <span className="text-amber">elevated but cautious</span>. Cross-faction
              cooperation is up 12% week-over-week, though sovereign liquidity exposure is approaching the
              chamber's historical danger threshold.
            </div>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-2">
            {[
              { l: "Cohesion", v: 82, c: "bg-amber" },
              { l: "Liquidity", v: 41, c: "bg-crimson" },
              { l: "Turnout", v: 68, c: "bg-cyan" },
              { l: "Trust", v: 79, c: "bg-amber" },
            ].map((s) => (
              <div key={s.l} className="rounded-sm border hairline p-2.5">
                <div className="flex justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-muted-foreground">
                  <span>{s.l}</span><span>{s.v}</span>
                </div>
                <div className="mt-1.5 h-0.5 bg-foreground/5 rounded-full overflow-hidden">
                  <div className={`${s.c} h-full`} style={{ width: `${s.v}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h3 className="font-serif text-[15px]">{title}</h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">{subtitle}</p>
    </div>
  );
}

function FactionBars() {
  return (
    <div className="mt-4 space-y-3">
      {factionInfluence.map((f) => (
        <div key={f.name}>
          <div className="flex justify-between text-[12px] mb-1">
            <span>{f.name}</span>
            <span className="font-mono text-muted-foreground">{f.value}%</span>
          </div>
          <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
            <div className="h-full" style={{ width: `${f.value * 2.5}%`, background: f.color, maxWidth: "100%" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function PredictionGauge() {
  const value = 61;
  const r = 56;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="my-3 mx-auto relative" style={{ width: 140, height: 140 }}>
      <svg viewBox="0 0 140 140" className="-rotate-90">
        <circle cx="70" cy="70" r={r} stroke="var(--muted)" strokeWidth="6" fill="none" />
        <circle
          cx="70" cy="70" r={r}
          stroke="var(--amber)" strokeWidth="6" fill="none"
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="font-serif text-2xl text-amber">{value}%</div>
          <div className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Likely Pass</div>
        </div>
      </div>
    </div>
  );
}

function SentimentChart() {
  const data = [44, 46, 43, 48, 52, 49, 55, 58, 54, 60, 63, 61, 65, 68, 64, 70, 72, 69, 74];
  const oppose = [32, 31, 34, 33, 30, 31, 28, 27, 29, 26, 25, 27, 24, 23, 25, 22, 21, 23, 20];
  const w = 600, h = 160;
  const max = 100;
  const pl = (arr: number[]) =>
    arr.map((v, i) => `${(i / (arr.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <div className="mt-4 grid-bg rounded-sm border hairline p-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
        <defs>
          <linearGradient id="sa" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--amber)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--amber)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,${h} ${pl(data)} ${w},${h}`} fill="url(#sa)" />
        <polyline points={pl(data)} fill="none" stroke="var(--amber)" strokeWidth="1.5" />
        <polyline points={pl(oppose)} fill="none" stroke="var(--crimson)" strokeWidth="1.5" strokeDasharray="3 3" />
      </svg>
      <div className="mt-2 flex gap-4 font-mono text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-amber" /> Endorse</span>
        <span className="flex items-center gap-1.5"><span className="h-0.5 w-3 bg-crimson" /> Oppose</span>
      </div>
    </div>
  );
}
