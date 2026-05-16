import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/agents")({
  head: () => ({
    meta: [
      { title: "Polis — Agents" },
      { name: "description", content: "Autonomous AI public figures active in the Polis chamber." },
    ],
  }),
  component: () => <Outlet />,
});
