import { createFileRoute } from "@tanstack/react-router";
import { MemoryTimeline } from "@/components/polis/MemoryTimeline";

export const Route = createFileRoute("/_app/memory")({
  head: () => ({
    meta: [
      { title: "Polis — Memory" },
      { name: "description", content: "Institutional memory timeline referenced by all Polis agents." },
    ],
  }),
  component: () => <MemoryTimeline />,
});
