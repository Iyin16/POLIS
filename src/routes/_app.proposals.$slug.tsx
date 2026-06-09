import { createFileRoute } from "@tanstack/react-router";
import { ProposalDetail } from "@/components/polis/ProposalDetail";

export const Route = createFileRoute("/_app/proposals/$slug")({
  head: () => ({
    meta: [
      { title: "Polis — Proposal" },
      { name: "description", content: "Proposal detail in the Polis chamber." },
    ],
  }),
  component: () => {
    const { slug } = Route.useParams();
    return <ProposalDetail slug={slug} />;
  },
});
