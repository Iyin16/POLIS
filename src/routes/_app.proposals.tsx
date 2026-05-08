import { createFileRoute } from "@tanstack/react-router";
import { ProposalPanel } from "@/components/polis/ProposalPanel";

export const Route = createFileRoute("/_app/proposals")({
  head: () => ({
    meta: [
      { title: "Polis — Proposals" },
      { name: "description", content: "Active DAO proposals deliberated by the Polis chamber." },
    ],
  }),
  component: ProposalsPage,
});

function ProposalsPage() {
  return (
    <div className="flex">
      <ProposalPanel />
    </div>
  );
}
