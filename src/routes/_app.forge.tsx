import { createFileRoute } from "@tanstack/react-router";
import { Forge } from "@/components/polis/Forge";

export const Route = createFileRoute("/_app/forge")({
  head: () => ({
    meta: [
      { title: "Polis — Forge a Sovereign Agent" },
      { name: "description", content: "Initialize a sovereign AI political entity on Arbitrum." },
    ],
  }),
  component: () => <Forge />,
});
