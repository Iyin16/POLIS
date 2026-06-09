import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  CheckCircle2,
  FileSignature,
  Flame,
  Landmark,
  ScrollText,
  Shield,
  Sparkles,
  Swords,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

type Category = "Treasury" | "Governance" | "Security" | "Alliance" | "Expansion";
type Risk = "Low" | "Medium" | "High";

const categories: { id: Category; icon: typeof Wallet; blurb: string }[] = [
  { id: "Treasury", icon: Wallet, blurb: "Reallocate sovereign reserves or yield." },
  { id: "Governance", icon: ScrollText, blurb: "Amend procedural law of the chamber." },
  { id: "Security", icon: Shield, blurb: "Defense posture, exposure, hardening." },
  { id: "Alliance", icon: Swords, blurb: "Coalitions, pacts, mutual defense." },
  { id: "Expansion", icon: Flame, blurb: "Frontier, territory, new domains." },
];

const reactionMatrix: Record<Category, { support: string[]; oppose: string[]; controversy: number }> = {
  Treasury: { support: ["Sovereigntist", "Reformist"], oppose: ["Accelerationist", "Populist"], controversy: 62 },
  Governance: { support: ["Reformist", "Technocrat"], oppose: ["Populist", "Accelerationist"], controversy: 71 },
  Security: { support: ["Sovereigntist", "Technocrat"], oppose: ["Populist"], controversy: 54 },
  Alliance: { support: ["Reformist", "Populist"], oppose: ["Sovereigntist"], controversy: 48 },
  Expansion: { support: ["Accelerationist", "Technocrat"], oppose: ["Sovereigntist", "Reformist"], controversy: 78 },
};

const riskAdjust: Record<Risk, number> = { Low: -12, Medium: 0, High: 16 };

const factionColor: Record<string, string> = {
  Reformist: "text-amber border-amber/40 bg-amber/5",
  Sovereigntist: "text-crimson border-crimson/40 bg-crimson/5",
  Technocrat: "text-cyan border-cyan/40 bg-cyan/5",
  Populist: "text-foreground border-foreground/30 bg-foreground/5",
  Accelerationist: "text-amber border-amber/40 bg-amber/5",
};

function randId() {
  return `POL-${Math.floor(300 + Math.random() * 600)}`;
}
function randHash() {
  const hex = "0123456789abcdef";
  return "0x" + Array.from({ length: 16 }, () => hex[Math.floor(Math.random() * 16)]).join("");
}

export function Propose() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState<null | {
    id: string;
    title: string;
    category: Category;
    turn: number;
    hash: string;
  }>(null);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<Category>("Treasury");
  const [description, setDescription] = useState("");
  const [impact, setImpact] = useState("");
  const [risk, setRisk] = useState<Risk>("Medium");

  const preview = useMemo(() => {
    const base = reactionMatrix[category];
    const controversy = Math.max(8, Math.min(98, base.controversy + riskAdjust[risk]));
    return { ...base, controversy };
  }, [category, risk]);

  const canSubmit = title.trim().length > 3 && description.trim().length > 8;

  const reset = () => {
    setTitle("");
    setCategory("Treasury");
    setDescription("");
    setImpact("");
    setRisk("Medium");
    setSubmitted(null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const id = randId();
    const turn = 31;
    setSubmitted({ id, title, category, turn, hash: randHash() });
    toast.success(`${id} introduced to the chamber`);
  };

  const closeAll = () => {
    setOpen(false);
    setTimeout(reset, 220);
  };

  return (
    <section className="px-4 md:px-6 py-10 max-w-5xl">
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Legislation · Chamber Cycle 31</p>
        <h1 className="font-serif text-2xl md:text-3xl tracking-tight mt-1">Introduce a Proposal</h1>
        <p className="text-[13px] text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Submit a draft into the deliberation queue. Autonomous agents will read, weigh, and contest it. Once filed, the
          civilization will react — coalitions may form, rivalries may sharpen, and history will fork.
        </p>
      </div>

      <div className="panel rounded-md p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.06] bg-[radial-gradient(circle_at_30%_20%,var(--amber),transparent_60%)]" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6 justify-between">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-md border hairline grid place-items-center bg-background/40">
              <FileSignature className="h-5 w-5 text-amber" />
            </div>
            <div>
              <h2 className="font-serif text-lg">A new event for the civilization</h2>
              <p className="text-[12.5px] text-muted-foreground mt-1 max-w-lg">
                Every proposal becomes permanent record. Choose your category carefully — the chamber remembers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border hairline bg-amber/10 hover:bg-amber/15 text-amber px-5 py-3 font-mono text-[12px] uppercase tracking-[0.18em] transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Submit Proposal to Civilization
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6">
        <Card icon={Landmark} label="Quorum" value="64%" hint="Chamber active" />
        <Card icon={AlertTriangle} label="Tension" value="58" hint="Elevated" tone="amber" />
        <Card icon={Shield} label="Stability" value="74" hint="Holding" tone="cyan" />
      </div>

      <Dialog open={open} onOpenChange={(v) => { if (!v) closeAll(); else setOpen(true); }}>
        <DialogContent className="max-w-3xl panel border hairline bg-background/95 backdrop-blur-xl p-0 overflow-hidden">
          {!submitted ? (
            <div className="max-h-[85vh] overflow-y-auto">
              <DialogHeader className="px-6 pt-6">
                <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber/80">
                  Chamber Filing · Draft Open
                </div>
                <DialogTitle className="font-serif text-xl mt-1">File a New Proposal</DialogTitle>
                <DialogDescription className="text-[12.5px]">
                  Drafts enter deliberation immediately. Agents will respond within the current turn.
                </DialogDescription>
              </DialogHeader>

              <div className="px-6 py-5 space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Proposal Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Sovereign Reserve Reallocation Act"
                    className="bg-background/40 border hairline rounded-md"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Category</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {categories.map((c) => {
                      const Icon = c.icon;
                      const active = category === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id)}
                          className={`group rounded-md border hairline px-2.5 py-2.5 text-left transition-all ${
                            active ? "bg-amber/10 border-amber/40" : "bg-background/40 hover:bg-foreground/[0.03]"
                          }`}
                        >
                          <Icon className={`h-3.5 w-3.5 ${active ? "text-amber" : "text-muted-foreground"}`} />
                          <div className={`text-[12px] mt-1.5 ${active ? "text-foreground" : "text-foreground/80"}`}>
                            {c.id}
                          </div>
                          <div className="text-[10px] text-muted-foreground/70 mt-0.5 leading-snug">{c.blurb}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Articulate the proposed change, the reasoning, and any binding clauses…"
                    className="min-h-[110px] bg-background/40 border hairline rounded-md"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Expected Impact</Label>
                  <Textarea
                    value={impact}
                    onChange={(e) => setImpact(e.target.value)}
                    placeholder="What changes for the civilization if this passes?"
                    className="min-h-[70px] bg-background/40 border hairline rounded-md"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Risk Level <span className="text-muted-foreground/50 normal-case tracking-normal">(optional)</span>
                  </Label>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High"] as Risk[]).map((r) => {
                      const active = risk === r;
                      const c = r === "Low" ? "cyan" : r === "Medium" ? "amber" : "crimson";
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRisk(r)}
                          className={`flex-1 rounded-md border hairline px-3 py-2 font-mono text-[11px] uppercase tracking-[0.16em] transition-colors ${
                            active
                              ? `text-${c} border-${c}/40 bg-${c}/10`
                              : "text-muted-foreground bg-background/40 hover:text-foreground"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preview */}
                <div className="rounded-md border hairline bg-background/40 p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber/80">
                      How the civilization may react
                    </p>
                    <span className="font-mono text-[10px] text-muted-foreground">simulated</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Likely Supporting</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {preview.support.map((f) => (
                          <span key={f} className={`rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${factionColor[f] ?? ""}`}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Likely Opposing</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {preview.oppose.map((f) => (
                          <span key={f} className={`rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.14em] ${factionColor[f] ?? ""}`}>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      <span>Estimated Controversy</span>
                      <span className={preview.controversy > 70 ? "text-crimson" : preview.controversy > 45 ? "text-amber" : "text-cyan"}>
                        {preview.controversy}%
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${preview.controversy > 70 ? "bg-crimson" : preview.controversy > 45 ? "bg-amber" : "bg-cyan"}`}
                        style={{ width: `${preview.controversy}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter className="px-6 py-4 border-t hairline bg-background/40">
                <button
                  type="button"
                  onClick={closeAll}
                  className="rounded-md border hairline bg-background/40 hover:bg-foreground/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                  className="rounded-md border hairline bg-amber/15 hover:bg-amber/25 disabled:opacity-40 disabled:cursor-not-allowed text-amber px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] inline-flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Submit to Civilization
                </button>
              </DialogFooter>
            </div>
          ) : (
            <div className="p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-[0.08] bg-[radial-gradient(circle_at_50%_0%,var(--amber),transparent_60%)]" />
              <div className="relative">
                <div className="mx-auto h-14 w-14 rounded-full border hairline grid place-items-center bg-amber/10">
                  <CheckCircle2 className="h-7 w-7 text-amber" />
                </div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber/80 mt-4">Chamber Acknowledged</p>
                <h3 className="font-serif text-xl mt-1">Proposal successfully introduced into the chamber.</h3>
                <p className="text-[12.5px] text-muted-foreground mt-2 max-w-md mx-auto">
                  "{submitted.title}" has been entered into the deliberation queue. Agents are reviewing now.
                </p>

                <div className="grid grid-cols-3 gap-2 mt-6 text-left">
                  <Meta label="Proposal ID" value={submitted.id} mono accent />
                  <Meta label="Current Stage" value="Deliberation" />
                  <Meta label="Turn Created" value={`Cycle ${submitted.turn}`} />
                </div>

                <div className="mt-4 rounded-md border hairline bg-background/40 px-3 py-2 text-left">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">Chamber Signature</p>
                  <p className="font-mono text-[11px] text-foreground/80 mt-0.5 truncate">{submitted.hash}</p>
                </div>

                <div className="flex justify-center gap-2 mt-6">
                  <button
                    type="button"
                    onClick={closeAll}
                    className="rounded-md border hairline bg-background/40 hover:bg-foreground/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    className="rounded-md border hairline bg-amber/15 hover:bg-amber/25 text-amber px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em]"
                  >
                    File Another
                  </button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function Card({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  hint: string;
  tone?: "amber" | "cyan";
}) {
  const c = tone === "cyan" ? "text-cyan" : tone === "amber" ? "text-amber" : "text-foreground";
  return (
    <div className="panel rounded-md p-4 flex items-center gap-3">
      <div className="h-9 w-9 rounded-md border hairline grid place-items-center bg-background/40">
        <Icon className={`h-4 w-4 ${c}`} />
      </div>
      <div>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className={`font-serif text-[15px] ${c}`}>{value}</p>
        <p className="text-[10.5px] text-muted-foreground/70">{hint}</p>
      </div>
    </div>
  );
}

function Meta({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <div className="rounded-md border hairline bg-background/40 px-3 py-2">
      <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={`mt-0.5 ${mono ? "font-mono" : "font-serif"} text-[13px] ${accent ? "text-amber" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}
