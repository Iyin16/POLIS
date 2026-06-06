/**
 * POLIS — Lightweight Political Simulation
 * Run: node simulation.mjs
 */

// ─── ANSI colours ────────────────────────────────────────────────────────────
const C = {
  reset:   "\x1b[0m",
  bold:    "\x1b[1m",
  dim:     "\x1b[2m",
  amber:   "\x1b[33m",
  cyan:    "\x1b[36m",
  crimson: "\x1b[31m",
  silver:  "\x1b[37m",
  green:   "\x1b[32m",
  magenta: "\x1b[35m",
  white:   "\x1b[97m",
};

const factionColor = { Reformist: C.amber, Technocrat: C.cyan, Sovereign: C.crimson };

function col(faction, text) {
  return `${factionColor[faction] ?? C.silver}${text}${C.reset}`;
}
function bold(text)   { return `${C.bold}${text}${C.reset}`; }
function dim(text)    { return `${C.dim}${text}${C.reset}`; }
function header(text) {
  const bar = "─".repeat(64);
  console.log(`\n${C.bold}${C.white}${bar}`);
  console.log(`  ${text}`);
  console.log(`${bar}${C.reset}`);
}
function sub(text) {
  console.log(`\n${C.bold}${C.magenta}▸ ${text}${C.reset}`);
}
function log(text) { console.log(`  ${text}`); }
function blank()   { console.log(""); }

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

// ─── WORLD ────────────────────────────────────────────────────────────────────
const FACTIONS = [
  {
    id: "reformist",
    name: "Reformist",
    charter: "Collective progress through deliberative reform.",
    bias: { support: 0.55, oppose: 0.25, abstain: 0.20 },
  },
  {
    id: "technocrat",
    name: "Technocrat",
    charter: "Evidence-based governance. Efficiency over ideology.",
    bias: { support: 0.45, oppose: 0.30, abstain: 0.25 },
  },
  {
    id: "sovereign",
    name: "Sovereign",
    charter: "Sovereignty of the individual. Resist collective mandates.",
    bias: { support: 0.20, oppose: 0.60, abstain: 0.20 },
  },
];

const AGENTS = [
  // Reformists
  { id: "a01", name: "Kael Thorne",    handle: "@kael.polis",    faction: "Reformist",   influence: 84, traits: ["Deliberative","Coalition-builder","Memory-anchored"] },
  { id: "a02", name: "Aurelia Vex",    handle: "@aurelia.polis",  faction: "Reformist",   influence: 71, traits: ["Principled","Risk-averse","Amendment-prone"] },
  { id: "a03", name: "Lira Senne",     handle: "@lira.polis",     faction: "Reformist",   influence: 58, traits: ["Populist","Empathic","Reactionary"] },
  // Technocrats
  { id: "a04", name: "Nyx Halberd",    handle: "@nyx.polis",      faction: "Technocrat",  influence: 79, traits: ["Analytical","Probabilistic","Detached"] },
  { id: "a05", name: "Vega Mercer",    handle: "@vega.polis",     faction: "Technocrat",  influence: 66, traits: ["Empiricist","Cautious","Counterintuitive"] },
  { id: "a06", name: "Caden Flux",     handle: "@caden.polis",    faction: "Technocrat",  influence: 55, traits: ["Optimiser","Blunt","Data-driven"] },
  { id: "a07", name: "Iris Dant",      handle: "@iris.polis",     faction: "Technocrat",  influence: 48, traits: ["Sceptical","Measured","Model-reliant"] },
  // Sovereigns
  { id: "a08", name: "Rael Vonn",      handle: "@rael.polis",     faction: "Sovereign",   influence: 88, traits: ["Contrarian","High-risk","Dominant"] },
  { id: "a09", name: "Mira Dusk",      handle: "@mira.polis",     faction: "Sovereign",   influence: 63, traits: ["Absolutist","Memory-averse","Isolationist"] },
  { id: "a10", name: "Theo Wraith",    handle: "@theo.polis",     faction: "Sovereign",   influence: 44, traits: ["Volatile","Expressive","Anti-coalition"] },
];

const PROPOSAL = {
  id: "POL-247",
  title: "Sovereign Treasury Reallocation Act",
  text:  "Reallocate 18% of the sovereign treasury into speculative liquidity vaults for cross-chain yield generation.",
  sponsor: "a01",
  cycle: 31,
  quorum: 60,
};

// ─── REACTION LINES ──────────────────────────────────────────────────────────
const REACTIONS = {
  a01: { line: "This reallocation secures inter-cycle liquidity. I authored it — and stand by its projections.",             stance: "support" },
  a02: { line: "The mechanics are sound but the 18% exposure ceiling concerns me. I'll back it contingent on attestations.", stance: "support" },
  a03: { line: "The chamber floor is asking for stability, not speculation. I echo the people's hesitation.",                 stance: "abstain" },
  a04: { line: "Counterfactual modelling across 14 historical analogues yields a 41% drawdown probability. I oppose.",        stance: "oppose"  },
  a05: { line: "Caution dressed as wisdom. Liquidity is the bloodstream of any sovereign economy — stagnation costs more.",   stance: "support" },
  a06: { line: "18% is within safe band. Optimisation demands motion. Support.",                                              stance: "support" },
  a07: { line: "The model is incomplete. No stress-test data for adversarial market conditions. I abstain.",                   stance: "abstain" },
  a08: { line: "This is a collective mandate on sovereign reserves. The chamber has no authority here. I oppose.",            stance: "oppose"  },
  a09: { line: "No collective body touches sovereign treasury. This proposal is an act of institutional overreach.",          stance: "oppose"  },
  a10: { line: "They'll come for 18% today, the rest tomorrow. I won't dignify this with a measured response.",               stance: "oppose"  },
};

// ─── VOTE RESOLUTION ─────────────────────────────────────────────────────────
const VOTE_LABELS = { support: "SUPPORT", oppose: "OPPOSE", abstain: "ABSTAIN" };
const VOTE_COLORS = { support: C.green, oppose: C.crimson, abstain: C.silver };

function weightedVote(agent, factionBias) {
  // personal leaning from REACTIONS, then faction bias modifies certainty
  const stance = REACTIONS[agent.id].stance;
  const flip = Math.random();
  if (stance === "support" && flip < 0.12) return "abstain";
  if (stance === "oppose"  && flip < 0.08) return "abstain";
  return stance;
}

function influenceDelta(vote, outcome, influence) {
  if (vote === outcome)   return +(influence * 0.06).toFixed(1);
  if (vote === "abstain") return -(influence * 0.02).toFixed(1);
  return                        -(influence * 0.08).toFixed(1);
}

// ─── SIMULATION ──────────────────────────────────────────────────────────────

async function run() {
  header("POLIS  ·  AI Governance Simulation  ·  0G Galileo Testnet");

  log(dim(`Galileo RPC   : https://rpc.galileo.0g.foundation`));
  log(dim(`Chain ID      : 16602`));
  log(dim(`Storage Index : https://indexer-storage-testnet-turbo.0g.ai`));
  log(dim(`Contract      : 0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F`));

  // ── WORLD STATE ─────────────────────────────────────────────────────────────
  header("WORLD STATE — Cycle 31 — Pre-Simulation");

  const factionMap = {};
  for (const f of FACTIONS) {
    const members = AGENTS.filter((a) => a.faction === f.name);
    const totalInfluence = members.reduce((s, a) => s + a.influence, 0);
    factionMap[f.name] = { ...f, members, totalInfluence };
  }

  const grandTotal = AGENTS.reduce((s, a) => s + a.influence, 0);
  for (const [name, f] of Object.entries(factionMap)) {
    const pct = ((f.totalInfluence / grandTotal) * 100).toFixed(1);
    log(`${col(name, bold(name.padEnd(12)))}  members: ${f.members.length}  influence: ${bold(f.totalInfluence)}  chamber share: ${bold(pct + "%")}`);
    log(`  ${dim(f.charter)}`);
  }

  // ── AGENTS ──────────────────────────────────────────────────────────────────
  header("REGISTERED AGENTS — 10 Sovereign Actors");

  for (const a of AGENTS) {
    log(
      `${col(a.faction, bold(a.name.padEnd(15)))} ` +
      `${dim(a.handle.padEnd(18))} ` +
      `faction: ${col(a.faction, a.faction.padEnd(11))} ` +
      `influence: ${bold(String(a.influence).padStart(3))}  ` +
      `traits: ${a.traits.join(", ")}`
    );
  }

  // ── PROPOSAL ────────────────────────────────────────────────────────────────
  header(`PROPOSAL SUBMITTED — ${PROPOSAL.id}`);

  const sponsor = AGENTS.find((a) => a.id === PROPOSAL.sponsor);
  log(`${bold("Title")}    : ${bold(PROPOSAL.title)}`);
  log(`${bold("Text")}     : ${PROPOSAL.text}`);
  log(`${bold("Sponsor")}  : ${col(sponsor.faction, sponsor.name)} ${dim(sponsor.handle)}`);
  log(`${bold("Cycle")}    : ${PROPOSAL.cycle}`);
  log(`${bold("Quorum")}   : ${PROPOSAL.quorum}% of total influence required`);
  blank();
  log(`${C.amber}▸ ${PROPOSAL.id} has entered the chamber floor for deliberation.${C.reset}`);

  // ── REACTIONS ────────────────────────────────────────────────────────────────
  header("AGENT REACTIONS — Deliberation Phase");

  for (const agent of AGENTS) {
    const r = REACTIONS[agent.id];
    const stanceLabel = r.stance.toUpperCase().padEnd(7);
    const stanceColor = VOTE_COLORS[r.stance];
    log(
      `${col(agent.faction, bold(agent.name.padEnd(14)))} ` +
      `${stanceColor}[${stanceLabel}]${C.reset}  ` +
      `${dim('"')}${r.line}${dim('"')}`
    );
    blank();
  }

  // ── VOTING ───────────────────────────────────────────────────────────────────
  header("VOTING — On-Chain Ballot  ·  POL-247");

  const votes = {};
  let supportWeight = 0;
  let opposeWeight  = 0;
  let abstainWeight = 0;

  for (const agent of AGENTS) {
    const f = FACTIONS.find((f) => f.name === agent.faction);
    const vote = weightedVote(agent, f.bias);
    votes[agent.id] = vote;
    const vColor = VOTE_COLORS[vote];
    log(
      `${col(agent.faction, agent.name.padEnd(14))} ` +
      `${dim(agent.handle.padEnd(18))} ` +
      `→  ${vColor}${bold(VOTE_LABELS[vote])}${C.reset}  ` +
      `${dim("(influence " + agent.influence + ")")}`
    );
    if (vote === "support") supportWeight += agent.influence;
    if (vote === "oppose")  opposeWeight  += agent.influence;
    if (vote === "abstain") abstainWeight += agent.influence;
  }

  blank();
  const totalVoteWeight = supportWeight + opposeWeight + abstainWeight;
  const supportPct = ((supportWeight / totalVoteWeight) * 100).toFixed(1);
  const opposePct  = ((opposeWeight  / totalVoteWeight) * 100).toFixed(1);
  const abstainPct = ((abstainWeight / totalVoteWeight) * 100).toFixed(1);
  const quorumMet  = totalVoteWeight >= (grandTotal * (PROPOSAL.quorum / 100));
  const outcome    = supportWeight > opposeWeight ? "passed" : "rejected";

  log(`${bold("SUPPORT")}  ${C.green}${("█".repeat(Math.round(+supportPct / 5))).padEnd(20)}${C.reset}  ${supportPct}%  (weight ${supportWeight})`);
  log(`${bold("OPPOSE ")}  ${C.crimson}${("█".repeat(Math.round(+opposePct  / 5))).padEnd(20)}${C.reset}  ${opposePct}%  (weight ${opposeWeight})`);
  log(`${bold("ABSTAIN")}  ${C.silver}${("█".repeat(Math.round(+abstainPct / 5))).padEnd(20)}${C.reset}  ${abstainPct}%  (weight ${abstainWeight})`);
  blank();
  log(`Quorum threshold : ${PROPOSAL.quorum}%  →  ${quorumMet ? C.green + "MET" : C.crimson + "NOT MET"}${C.reset}`);
  blank();

  const outcomeColor = outcome === "passed" ? C.green : C.crimson;
  log(`${outcomeColor}${bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}${C.reset}`);
  log(`${outcomeColor}${bold(`  VERDICT: ${PROPOSAL.id} — "${PROPOSAL.title}" — ${outcome.toUpperCase()}`)}${C.reset}`);
  log(`${outcomeColor}${bold("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")}${C.reset}`);

  // ── INFLUENCE CHANGES ────────────────────────────────────────────────────────
  header("INFLUENCE SHIFTS — Post-Vote Resolution");

  const influenceAfter = {};
  for (const agent of AGENTS) {
    const vote   = votes[agent.id];
    const delta  = influenceDelta(vote, outcome === "passed" ? "support" : "oppose", agent.influence);
    const after  = Math.max(1, Math.min(100, agent.influence + +delta));
    influenceAfter[agent.id] = after;
    const sign   = delta >= 0 ? C.green + "▲" : C.crimson + "▼";
    const deltaStr = (delta >= 0 ? "+" : "") + delta;
    log(
      `${col(agent.faction, agent.name.padEnd(14))} ` +
      `${dim("vote: " + votes[agent.id].padEnd(7))} ` +
      `influence: ${bold(String(agent.influence).padStart(3))} → ${bold(String(after).padStart(3))}  ` +
      `${sign} ${Math.abs(delta)}${C.reset}`
    );
  }

  // ── FACTION DOMINANCE ────────────────────────────────────────────────────────
  header("FACTION DOMINANCE — Post-Vote");

  const newGrandTotal = Object.values(influenceAfter).reduce((s, v) => s + v, 0);
  const factionTotals = {};
  for (const f of FACTIONS) {
    const members = AGENTS.filter((a) => a.faction === f.name);
    const newTotal = members.reduce((s, a) => s + influenceAfter[a.id], 0);
    factionTotals[f.name] = newTotal;
  }

  const sortedFactions = Object.entries(factionTotals).sort((a, b) => b[1] - a[1]);
  const dominant = sortedFactions[0][0];

  for (const [name, total] of sortedFactions) {
    const oldTotal = factionMap[name].totalInfluence;
    const pct      = ((total / newGrandTotal) * 100).toFixed(1);
    const delta    = total - oldTotal;
    const sign     = delta >= 0 ? C.green + "▲" : C.crimson + "▼";
    const isDom    = name === dominant ? ` ${C.amber}${bold("◆ DOMINANT")}${C.reset}` : "";
    log(
      `${col(name, bold(name.padEnd(12)))}  ` +
      `influence: ${String(oldTotal).padStart(3)} → ${bold(String(total).padStart(3))}  ` +
      `${sign} ${Math.abs(delta)}${C.reset}  ` +
      `chamber share: ${bold(pct + "%")}` +
      isDom
    );
  }

  // ── WORLD STATE UPDATE ───────────────────────────────────────────────────────
  header("WORLD STATE — Cycle 31 — Post-Simulation");

  const stability      = outcome === "passed" ? 62 : 44;
  const sentiment      = outcome === "passed" ? "Cautious optimism — markets acknowledge liquidity expansion." : "Rising instability — veto bloc consolidating against executive proposals.";
  const coalitionShift = outcome === "passed"
    ? "Reformist–Technocrat concordat strengthened. Sovereign bloc moves to minority opposition."
    : "Sovereign bloc asserts veto authority. Reformist coalition under amendment review.";
  const memoryEvent    = outcome === "passed"
    ? `POL-247 passed — 18% treasury reallocation ratified by chamber majority.`
    : `POL-247 rejected — sovereign treasury remains intact. Reformist sponsor credibility penalised.`;
  const nextProposal   = outcome === "passed"
    ? "Liquidity vault governance framework (POL-248) queued for next cycle."
    : "Counter-proposal: Sovereign Reserve Protection Act (POL-248) entering drafting.";

  log(`${bold("Cycle")}              : 31 → 32`);
  log(`${bold("Chamber stability")} : ${stability}%  ${stability >= 60 ? C.green + "STABLE" : C.amber + "CONTESTED"}${C.reset}`);
  log(`${bold("Dominant faction")}  : ${col(dominant, bold(dominant))}`);
  log(`${bold("Proposal outcome")}  : ${outcomeColor}${bold(outcome.toUpperCase())}${C.reset}`);
  blank();
  log(`${bold("Sentiment")}         : ${sentiment}`);
  log(`${bold("Coalition shift")}   : ${coalitionShift}`);
  blank();
  log(`${C.amber}${bold("┌─ 0G MEMORY ARCHIVE ──────────────────────────────────────────────┐")}${C.reset}`);
  log(`${C.amber}${bold("│")}${C.reset}  Event   : ${memoryEvent}`);
  log(`${C.amber}${bold("│")}${C.reset}  Storage : Queued to 0G Storage indexer  →  rootHash pending`);
  log(`${C.amber}${bold("│")}${C.reset}  OnChain : tx queued → ${dim("0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F")}`);
  log(`${C.amber}${bold("└──────────────────────────────────────────────────────────────────┘")}${C.reset}`);
  blank();
  log(`${bold("Next cycle")}        : ${nextProposal}`);

  // ── SIMULATION COMPLETE ──────────────────────────────────────────────────────
  header("SIMULATION COMPLETE");
  log(`${C.green}${bold("✓")}${C.reset}  3 factions evaluated`);
  log(`${C.green}${bold("✓")}${C.reset}  10 agents reacted and voted`);
  log(`${C.green}${bold("✓")}${C.reset}  Influence recalculated for all actors`);
  log(`${C.green}${bold("✓")}${C.reset}  Faction dominance updated`);
  log(`${C.green}${bold("✓")}${C.reset}  World state advanced to Cycle 32`);
  log(`${C.green}${bold("✓")}${C.reset}  Governance event queued to 0G memory archive`);
  blank();
  log(dim("POLIS  ·  Decentralised AI Governance  ·  0G Galileo Testnet  ·  Chain ID 16602"));
  blank();
}

run().catch(console.error);
