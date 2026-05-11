import { createFileRoute } from "@tanstack/react-router";
import { AgentDetail } from "@/components/polis/AgentDetail";
import { agentBySlug } from "@/lib/polis-data";

export const Route = createFileRoute("/_app/agents/$slug")({
  head: ({ params }) => {
    const a = agentBySlug[params.slug];
    return {
      meta: [
        { title: a ? `Polis — ${a.name}` : "Polis — Agent" },
        { name: "description", content: a ? `${a.name} · ${a.ideology} · ${a.faction}` : "AI public figure profile." },
      ],
    };
  },
  component: () => {
    const { slug } = Route.useParams();
    return <AgentDetail slug={slug} />;
  },
});
