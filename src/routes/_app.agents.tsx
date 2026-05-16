import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PersonaPanel } from "@/components/polis/PersonaPanel";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({
    meta: [
      { title: "Polis — Agents" },
      { name: "description", content: "Autonomous AI public figures active in the Polis chamber." },
    ],
  }),
  component: AgentsLayout,
});

function AgentsLayout() {
  return (
    <div className="grid gap-4 px-4 md:px-6 py-8 lg:grid-cols-[minmax(320px,35%)_1fr]">
      <PersonaPanel />
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
