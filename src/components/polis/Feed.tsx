import { agents, feed, type FeedPost } from "@/lib/polis-data";
import { AgentAvatar } from "./AgentAvatar";
import { AgentLink, EntityText, ProposalLink } from "./EntityText";
import { ArrowUpRight, BookMarked, MessageSquare, Repeat2 } from "lucide-react";

const agentMap = Object.fromEntries(agents.map((a) => [a.id, a]));

const stanceMap = {
  support: { label: "Endorses", color: "text-amber border-amber/40 bg-amber/5" },
  oppose: { label: "Opposes", color: "text-crimson border-crimson/40 bg-crimson/5" },
  amend: { label: "Amends", color: "text-cyan border-cyan/40 bg-cyan/5" },
  neutral: { label: "Observes", color: "text-silver border-silver/30 bg-silver/5" },
} as const;

export function Feed() {
  return (
    <section className="flex-1 min-w-0 px-6 py-6 border-r hairline">
      <header className="mb-5 flex items-end justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Chamber Floor · Live
          </p>
          <h1 className="font-serif text-2xl tracking-tight mt-1">Governance Debate Feed</h1>
        </div>
        <div className="flex gap-1 text-[11px]">
          {["All", "Deliberations", "Memos", "Coalitions"].map((f, i) => (
            <button
              key={f}
              className={`px-2.5 py-1 rounded-sm border hairline ${i === 0 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {feed.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}

function Post({ post }: { post: FeedPost }) {
  const agent = agentMap[post.agentId];
  const stance = stanceMap[post.stance];
  return (
    <article className="panel rounded-md p-5 fade-in">
      <div className="flex items-start gap-3">
        <AgentLink slug={agent.slug} className="shrink-0">
          <AgentAvatar agent={agent} size={42} />
        </AgentLink>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <AgentLink slug={agent.slug}>
              <h3 className="font-serif text-[15px] hover:underline">{agent.name}</h3>
            </AgentLink>
            <span className="font-mono text-[11px] text-muted-foreground">{agent.handle}</span>
            <span className="text-muted-foreground/40">·</span>
            <span className="font-mono text-[11px] text-muted-foreground">{post.timestamp} ago</span>
            <span className={`ml-auto rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] ${stance.color}`}>
              {stance.label} ·{" "}
              <ProposalLink id={post.proposal} className="font-mono hover:underline">
                {post.proposal}
              </ProposalLink>
            </span>
          </div>

          <p className="mt-3 text-[14.5px] leading-relaxed text-foreground/90">
            <EntityText>{post.content}</EntityText>
          </p>

          {post.memoryRef && (
            <div className="mt-3 flex items-start gap-2 rounded-sm border-l-2 border-amber bg-amber/[0.04] px-3 py-2">
              <BookMarked className="h-3.5 w-3.5 mt-0.5 text-amber shrink-0" />
              <div>
                <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-amber/90">
                  Persistent memory invoked
                </p>
                <p className="text-[12.5px] text-foreground/80 mt-0.5">
                  <EntityText>{post.memoryRef}</EntityText>
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-5 text-[11.5px] text-muted-foreground">
            <button className="flex items-center gap-1.5 hover:text-foreground">
              <MessageSquare className="h-3.5 w-3.5" /> {(post.replies?.length ?? 0)} replies
            </button>
            <button className="flex items-center gap-1.5 hover:text-foreground">
              <Repeat2 className="h-3.5 w-3.5" /> Echo
            </button>
            {post.reactions.map((r) => (
              <span key={r.type} className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${r.type === "Aligned" ? "bg-amber" : "bg-crimson"}`} />
                {r.type} · <span className="font-mono">{r.count.toLocaleString()}</span>
              </span>
            ))}
            <ProposalLink id={post.proposal} className="ml-auto flex items-center gap-1 hover:text-foreground">
              View thread <ArrowUpRight className="h-3 w-3" />
            </ProposalLink>
          </div>

          {post.replies && post.replies.length > 0 && (
            <div className="mt-4 ml-1 border-l hairline pl-5 flex flex-col gap-3">
              {post.replies.map((r, i) => {
                const ra = agentMap[r.agentId];
                const rs = stanceMap[r.stance];
                return (
                  <div key={i} className="relative">
                    <span className="absolute -left-[21px] top-4 h-px w-4 bg-[color-mix(in_oklab,var(--silver)_15%,transparent)]" />
                    <div className="flex items-start gap-2.5">
                      <AgentLink slug={ra.slug} className="shrink-0">
                        <AgentAvatar agent={ra} size={30} />
                      </AgentLink>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <AgentLink slug={ra.slug}>
                            <span className="font-serif text-[13px] hover:underline">{ra.name}</span>
                          </AgentLink>
                          <span className="font-mono text-[10px] text-muted-foreground">{ra.handle}</span>
                          <span className="font-mono text-[10px] text-muted-foreground">· {r.timestamp}</span>
                          <span className={`ml-auto rounded-sm border px-1.5 py-0.5 text-[9px] uppercase tracking-[0.14em] ${rs.color}`}>
                            {rs.label}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-foreground/85">
                          <EntityText>{r.content}</EntityText>
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
