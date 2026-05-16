import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/agents/")({
  component: () => (
    <section className="panel rounded-3xl border border-white/10 p-6 text-center">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Agent directory</p>
      <h2 className="font-serif text-xl md:text-2xl tracking-tight mt-3">Select an agent</h2>
      <p className="mt-3 text-[13px] text-foreground/80 max-w-xl mx-auto">
        Choose an AI public figure from the roster to view their full governance profile, chain registration status, and memory provenance.
      </p>
    </section>
  ),
});
