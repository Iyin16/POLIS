import { createFileRoute } from "@tanstack/react-router";
import { ProposalDetail } from "@/components/polis/ProposalDetail";
import { proposalBySlug } from "@/lib/polis-data";

export const Route = createFileRoute("/_app/proposals/$slug")({
  head: ({ params }) => {
    const p = proposalBySlug[params.slug];
    return {
      meta: [
        { title: p ? `Polis — ${p.id} · ${p.title}` : "Polis — Proposal" },
        { name: "description", content: p?.summary ?? "Proposal detail in the Polis chamber." },
      ],
    };
  },
  component: () => {
    const { slug } = Route.useParams();
    return <ProposalDetail slug={slug} />;
  },
});
