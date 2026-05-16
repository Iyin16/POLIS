import { createFileRoute } from "@tanstack/react-router";
import { PersonaPanel } from "@/components/polis/PersonaPanel";

export const Route = createFileRoute("/_app/agents/")({
  component: () => <PersonaPanel />,
});
