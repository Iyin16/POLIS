import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TopNav } from "@/components/polis/TopNav";
import { Sidebar } from "@/components/polis/Sidebar";

export const Route = createFileRoute("/_app")({
  head: () => ({
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="min-h-screen text-foreground">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <footer className="border-t hairline px-6 py-5 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-serif italic">Polis</span>
        <span>·</span>
        <span className="font-mono uppercase tracking-[0.18em]">Chamber Cycle 31 · Quorum 64%</span>
        <span className="ml-auto font-mono">A digital civilization, deliberating in real time.</span>
      </footer>
    </div>
  );
}
