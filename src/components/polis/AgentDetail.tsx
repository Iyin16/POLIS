import { Link } from "@tanstack/react-router";
import { agentBySlug, agents, memoryByTitle, proposalById } from "@/lib/polis-data";
import { AgentAvatar } from "./AgentAvatar";
import { AgentLink, EntityText, MemoryLink, ProposalLink } from "./EntityText";
import { ArrowLeft } from "lucide-react";

const positionColor: Record<string, string> = {
  endorsed: "text-amber border-amber/40 bg-amber/5",
  opposed: "text-crimson border-crimson/40 bg-crimson/5",
  amended: "text-cyan border-cyan/40 bg-cyan/5",
  abstained: "text-silver border-silver/30 bg-silver/5",
};

const factionColor: Record<string, string> = {
  Reformist: "text-amber",
  Technocrat: "text-cyan",
  Sovereigntist: "text-crimson",
  Populist: "text-silver",
  Accelerationist: "text-muted-foreground",
};

export function AgentDetail({ slug }: { slug: string }) {
  const a = agentBySlug[slug];
  if (!a) return (
    <section className="px-6 py-12 max-w-2xl">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-crimson">Not in directory</p>
      <h1 className="font-serif text-2xl mt-2">Agent {slug} not found</h1>
      <Link to="/agents" className="inline-flex items-center gap-1.5 mt-4 font-mono text-[11px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Back to directory
      </Link>
    </section>
  );

  const allyAgents = a.allies.map((n) => agents.find((x) => x.name === n)).filter(Boolean) as typeof agents;
  const rivalAgents = a.rivals.map((n) => agents.find((x) => x.name === n)).filter(Boolean) as typeof agents;

  return (
    <section className="px-6 py-8 max-w-5xl">
      <Link to="/agents" className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Directory
      </Link>

      <header className="mt-4 mb-6 flex items-start gap-5">
        <AgentAvatar agent={a} size={72} />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Public Figure</p>
          <h1 className="font-serif text-3xl tracking-tight mt-1">{a.name}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] text-muted-foreground">
            <span>{a.handle}</span>
            <span>·</span>
            <span className={`font-serif italic ${factionColor[a.faction]}`}>{a.faction}</span>
            <span>·</span>
            <span>{a.ideology}</span>
            <span>·</span>
            <span className="uppercase tracking-[0.16em]">{a.status}</span>
          </div>
        </div>
        <div className="hidden sm:grid grid-cols-2 gap-2 w-56">
          <Stat label="REP" value={a.reputation} accent="amber" />
          <Stat label="INF" value={a.influence} accent="cyan" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <Block title="Governance Philosophy" className="lg:col-span-2">
          <p className="text-[13.5px] leading-relaxed text-foreground/85">{a.philosophy}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
            <Field label="Temperament">{a.temperament}</Field>
            <Field label="Risk Tolerance">{a.riskTolerance}</Field>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {a.traits.map((t) => (
              <span key={t} className="rounded-sm border hairline px-1.5 py-0.5 text-[9.5px] uppercase tracking-wider text-muted-foreground">
                {t}
              </span>
            ))}
          </div>
        </Block>

        <Block title="Coalition Relationships">
          <Field label="Allies">
            {allyAgents.length === 0 ? <span className="text-muted-foreground">—</span> : (
              <ul className="space-y-1 mt-1">
                {allyAgents.map((al) => (
                  <li key={al.id} className="flex items-center gap-2">
                    <AgentLink slug={al.slug} className="flex items-center gap-2 hover:underline">
                      <AgentAvatar agent={al} size={20} />
                      <span className="text-[12.5px]">{al.name}</span>
                    </AgentLink>
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="Rivals" className="mt-3">
            {rivalAgents.length === 0 ? <span className="text-muted-foreground">—</span> : (
              <ul className="space-y-1 mt-1">
                {rivalAgents.map((al) => (
                  <li key={al.id} className="flex items-center gap-2">
                    <AgentLink slug={al.slug} className="flex items-center gap-2 hover:underline">
                      <AgentAvatar agent={al} size={20} />
                      <span className="text-[12.5px]">{al.name}</span>
                    </AgentLink>
                  </li>
                ))}
              </ul>
            )}
          </Field>
          <Field label="Coalitions" className="mt-3">
            <ul className="space-y-0.5 mt-1">
              {a.coalitions.map((c) => (
                <li key={c} className="text-[12px] text-foreground/85">{c}</li>
              ))}
            </ul>
          </Field>
        </Block>
      </div>

      <Block title="Voting History" className="mt-3">
        <ul className="divide-y hairline">
          {a.votingHistory.map((v, i) => {
            const prop = proposalById[v.proposal];
            return (
              <li key={i} className="py-2.5 flex items-start gap-3">
                <ProposalLink id={v.proposal} className="font-mono text-[10.5px] tracking-[0.18em] text-amber pt-0.5 shrink-0 hover:underline">
                  {v.proposal}
                </ProposalLink>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {prop ? (
                      <ProposalLink id={v.proposal} className="font-serif text-[13.5px] hover:underline">
                        {prop.title}
                      </ProposalLink>
                    ) : (
                      <span className="font-serif text-[13.5px]">{v.proposal}</span>
                    )}
                    <span className={`ml-auto rounded-sm border px-1.5 py-0.5 text-[9.5px] uppercase tracking-[0.14em] ${positionColor[v.position]}`}>
                      {v.position}
                    </span>
                  </div>
                  <p className="mt-1 text-[12.5px] text-foreground/75 leading-relaxed">
                    <EntityText>{v.note}</EntityText>
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </Block>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <Block title="Persistent Memory References">
          <ul className="divide-y hairline">
            {a.memoryReferences.map((mr, i) => {
              const m = memoryByTitle[mr.memory];
              return (
                <li key={i} className="py-2.5">
                  {m ? (
                    <MemoryLink slug={m.slug} className="font-serif text-[13.5px] italic text-cyan hover:underline">
                      {mr.memory}
                    </MemoryLink>
                  ) : (
                    <span className="font-serif text-[13.5px] italic">{mr.memory}</span>
                  )}
                  <p className="mt-0.5 text-[12px] text-muted-foreground">{mr.note}</p>
                </li>
              );
            })}
          </ul>
        </Block>

        <Block title="Chamber Activity">
          <ul className="space-y-2">
            {a.recentActivity.map((act, i) => (
              <li key={i} className="flex gap-2 text-[12.5px]">
                <span className="text-amber mt-1.5 h-1 w-1 rounded-full bg-amber shrink-0" />
                <span className="text-foreground/85"><EntityText>{act}</EntityText></span>
              </li>
            ))}
          </ul>
        </Block>
      </div>
    </section>
  );
}

function Block({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`panel rounded-md p-4 ${className}`}>
      <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="text-[12.5px] text-foreground/85 mt-0.5">{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent: "amber" | "cyan" }) {
  return (
    <div className="rounded-sm border hairline bg-background/40 px-2 py-1.5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-widest text-muted-foreground">{label}</span>
        <span className={`font-mono text-[11px] ${accent === "amber" ? "text-amber" : "text-cyan"}`}>{value}</span>
      </div>
      <div className="mt-1 h-0.5 w-full bg-foreground/5 overflow-hidden rounded-full">
        <div className={`h-full ${accent === "amber" ? "bg-amber" : "bg-cyan"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
