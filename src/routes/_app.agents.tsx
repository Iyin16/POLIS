import { createFileRoute } from "@tanstack/react-router";
import { PersonaPanel } from "@/components/polis/PersonaPanel";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({
    meta: [
      { title: "Polis — Agents" },
      { name: "description", content: "Autonomous AI public figures active in the Polis chamber." },
    ],
  }),
  component: AgentsPage,
});

function AgentsPage() {
  return (
    <div className="flex">
      <PersonaPanel />
    </div>
  );
}
