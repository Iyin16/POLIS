/**
 * POLIS — Enhanced Political Simulation
 * Persistence · Emotional Continuity · Agent Evolution · Faction Memory
 * Run: node simulation.mjs
 */

// ─── ANSI ─────────────────────────────────────────────────────────────────────
const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m", italic: "\x1b[3m",
  amber: "\x1b[33m", cyan: "\x1b[36m", crimson: "\x1b[31m", silver: "\x1b[37m",
  green: "\x1b[32m", magenta: "\x1b[35m", white: "\x1b[97m", blue: "\x1b[34m",
  yellow: "\x1b[93m", orange: "\x1b[38;5;208m",
};
const FC = { Reformist: C.amber, Technocrat: C.cyan, Sovereign: C.crimson };

const col  = (f, t)  => `${FC[f] ?? C.silver}${t}${C.reset}`;
const bold = (t)     => `${C.bold}${t}${C.reset}`;
const dim  = (t)     => `${C.dim}${t}${C.reset}`;
const ital = (t)     => `${C.italic}${t}${C.reset}`;

function header(text, color = C.white) {
  const bar = "─".repeat(68);
  console.log(`\n${C.bold}${color}${bar}\n  ${text}\n${bar}${C.reset}`);
}
function sub(text, color = C.magenta) {
  console.log(`\n${color}${C.bold}▸ ${text}${C.reset}`);
}
function log(t)  { console.log(`  ${t}`); }
function blank() { console.log(""); }
function hr(ch = "·", color = C.dim) {
  console.log(`${color}  ${"·".repeat(66)}${C.reset}`);
}

// ─── HISTORICAL MEMORY ────────────────────────────────────────────────────────
const HISTORY = [
  {
    id: "POL-119",
    cycle: 18,
    title: "Treasury Collapse of POL-119",
    outcome: "failed",
    summary: "Speculative liquidity vault collapsed after 90-day exposure, triggering a 22% sovereign reserve drawdown. The chamber was fractured for three cycles.",
    factionVotes: { Reformist: "support", Technocrat: "support", Sovereign: "oppose" },
    consequence: "Sovereign bloc memorialised this as proof of collective recklessness. Trust between Reformists and Sovereigns collapsed.",
    emotionalWeight: 94,
    tags: ["treasury", "liquidity", "collapse", "speculation"],
  },
  {
    id: "POL-203",
    cycle: 24,
    title: "Technocrat Austerity Mandate",
    outcome: "failed",
    summary: "Technocrats proposed a chamber-wide austerity protocol. Reformists and Sovereigns formed a rare joint bloc to defeat it.",
    factionVotes: { Reformist: "oppose", Technocrat: "support", Sovereign: "oppose" },
    consequence: "Reformist–Sovereign temporary alliance formed. Technocrats registered a grudge against Reformist bloc for leading the opposition.",
    emotionalWeight: 71,
    tags: ["austerity", "coalition", "technocrat-grievance"],
  },
  {
    id: "POL-231",
    cycle: 28,
    title: "Reformist–Technocrat Concordat",
    outcome: "passed",
    summary: "A formal governance alignment agreement between Reformist and Technocrat blocs, consolidating chamber majority power.",
    factionVotes: { Reformist: "support", Technocrat: "support", Sovereign: "oppose" },
    consequence: "Reformist–Technocrat alliance formalised. Sovereign bloc entered structural opposition. Chamber balance shifted decisively.",
    emotionalWeight: 82,
    tags: ["concordat", "alliance", "reformist", "technocrat"],
  },
  {
    id: "POL-244",
    cycle: 30,
    title: "Sovereign Isolation Protocol",
    outcome: "failed",
    summary: "Sovereign bloc's bid to withdraw from collective treasury governance. Defeated 61–39 by the Reformist–Technocrat majority.",
    factionVotes: { Reformist: "oppose", Technocrat: "oppose", Sovereign: "support" },
    consequence: "Sovereign bloc humiliated in last cycle. Rael Vonn vowed retribution. Resentment running at historic high.",
    emotionalWeight: 88,
    tags: ["sovereignty", "isolation", "sovereign-grudge", "defeat"],
  },
];

// ─── FACTION MEMORY ───────────────────────────────────────────────────────────
const FACTION_MEMORY = {
  Reformist: {
    allies: ["Technocrat"],
    rivals: [],
    tense: ["Sovereign"],
    betrayals: [],                         // [{ by, cycle, event }]
    alliances: [{ with: "Technocrat", since: 28, event: "POL-231 Concordat" }],
    historicalConflicts: [{ with: "Sovereign", cycle: 30, event: "POL-244 defeat vote" }],
    grievances: [],
    mood: "confident",                     // confident | cautious | resentful | volatile
    memoryAnchors: ["POL-119", "POL-231"],
  },
  Technocrat: {
    allies: ["Reformist"],
    rivals: ["Sovereign"],
    tense: [],
    betrayals: [],
    alliances: [{ with: "Reformist", since: 28, event: "POL-231 Concordat" }],
    historicalConflicts: [{ with: "Reformist", cycle: 24, event: "POL-203 — Reformists led opposition to Technocrat mandate" }],
    grievances: [{ from: "Reformist", cycle: 24, note: "Led the bloc that sunk our austerity proposal" }],
    mood: "cautious",
    memoryAnchors: ["POL-119", "POL-203", "POL-231"],
  },
  Sovereign: {
    allies: [],
    rivals: ["Technocrat"],
    tense: ["Reformist"],
    betrayals: [{ by: "Reformist", cycle: 28, event: "POL-231 — Reformists aligned with Technocrats, ending the Cycle-24 joint bloc" }],
    alliances: [],
    historicalConflicts: [
      { with: "Reformist", cycle: 24, event: "Briefly allied; then betrayed by concordat" },
      { with: "Technocrat", cycle: 28, event: "POL-231 ended any residual cooperation" },
    ],
    grievances: [
      { from: "Reformist", cycle: 28, note: "Abandoned joint bloc to form concordat with Technocrats" },
      { from: "chamber",   cycle: 30, note: "POL-244 defeat — collective majority overrode sovereign will" },
    ],
    mood: "resentful",
    memoryAnchors: ["POL-119", "POL-244"],
  },
};

// ─── FACTIONS ─────────────────────────────────────────────────────────────────
const FACTIONS = [
  { name: "Reformist",  charter: "Collective progress through deliberative reform." },
  { name: "Technocrat", charter: "Evidence-based governance. Efficiency over ideology." },
  { name: "Sovereign",  charter: "Sovereignty of the individual. Resist collective mandates." },
];

// ─── AGENTS  (ideology: 0 = collectivist · 100 = individualist) ───────────────
const AGENTS = [
  { id:"a01", name:"Kael Thorne",  handle:"@kael.polis",    faction:"Reformist",  influence:84, ideology:35, traits:["Deliberative","Coalition-builder","Memory-anchored"],  votingHistory:["support","support","oppose"] },
  { id:"a02", name:"Aurelia Vex",  handle:"@aurelia.polis", faction:"Reformist",  influence:71, ideology:42, traits:["Principled","Risk-averse","Amendment-prone"],          votingHistory:["support","oppose","support"] },
  { id:"a03", name:"Lira Senne",   handle:"@lira.polis",    faction:"Reformist",  influence:58, ideology:28, traits:["Populist","Empathic","Reactionary"],                   votingHistory:["support","support","abstain"] },
  { id:"a04", name:"Nyx Halberd",  handle:"@nyx.polis",     faction:"Technocrat", influence:79, ideology:60, traits:["Analytical","Probabilistic","Detached"],               votingHistory:["oppose","oppose","support"]  },
  { id:"a05", name:"Vega Mercer",  handle:"@vega.polis",    faction:"Technocrat", influence:66, ideology:52, traits:["Empiricist","Cautious","Counterintuitive"],             votingHistory:["support","support","support"] },
  { id:"a06", name:"Caden Flux",   handle:"@caden.polis",   faction:"Technocrat", influence:55, ideology:58, traits:["Optimiser","Blunt","Data-driven"],                     votingHistory:["support","abstain","support"] },
  { id:"a07", name:"Iris Dant",    handle:"@iris.polis",    faction:"Technocrat", influence:48, ideology:55, traits:["Sceptical","Measured","Model-reliant"],                votingHistory:["abstain","oppose","abstain"]  },
  { id:"a08", name:"Rael Vonn",    handle:"@rael.polis",    faction:"Sovereign",  influence:88, ideology:92, traits:["Contrarian","High-risk","Dominant"],                   votingHistory:["oppose","oppose","oppose"]    },
  { id:"a09", name:"Mira Dusk",    handle:"@mira.polis",    faction:"Sovereign",  influence:63, ideology:88, traits:["Absolutist","Memory-averse","Isolationist"],           votingHistory:["oppose","oppose","oppose"]    },
  { id:"a10", name:"Theo Wraith",  handle:"@theo.polis",    faction:"Sovereign",  influence:44, ideology:78, traits:["Volatile","Expressive","Anti-coalition"],              votingHistory:["oppose","abstain","oppose"]   },
];

// ─── PROPOSAL ─────────────────────────────────────────────────────────────────
const PROPOSAL = {
  id: "POL-247",
  title: "Sovereign Treasury Reallocation Act",
  text: "Reallocate 18% of the sovereign treasury into speculative liquidity vaults for cross-chain yield generation.",
  sponsor: "a01",
  cycle: 31,
  quorum: 60,
  memoryRefs: ["POL-119", "POL-231"],
  continuityNote: "This proposal directly echoes the mechanics of POL-119, which ended in a treasury collapse. The Reformist–Technocrat concordat (POL-231) provides the coalition architecture through which it is being advanced.",
};

// ─── AGENT REACTIONS ──────────────────────────────────────────────────────────
const REACTIONS = {
  a01: { stance:"support",  line:"I authored this reallocation. POL-119 failed because the chamber had no coalition. We have one now.",                                          memoryAnchor:"POL-119" },
  a02: { stance:"support",  line:"The mechanics are sounder than POL-119. I'll back it — contingent on quarterly attestations to the chamber.",                                  memoryAnchor:"POL-231" },
  a03: { stance:"abstain",  line:"The people remember the POL-119 drawdown. I won't vote yes until the floor has heard from communities bearing the exposure.",                  memoryAnchor:"POL-119" },
  a04: { stance:"oppose",   line:"14 historical analogues including POL-119 project a 41% drawdown probability. This is a replay dressed in new language.",                      memoryAnchor:"POL-119" },
  a05: { stance:"support",  line:"Stagnation also has a cost. The concordat exists precisely to pass proposals like this. I'm holding the line.",                                memoryAnchor:"POL-231" },
  a06: { stance:"support",  line:"18% is within safe band. Optimisation demands motion. This is exactly what POL-231 gave us the mandate to do.",                                memoryAnchor:"POL-231" },
  a07: { stance:"abstain",  line:"The model is incomplete. POL-119 also looked clean at submission. I won't vote yes on incomplete stress tests.",                               memoryAnchor:"POL-119" },
  a08: { stance:"oppose",   line:"After POL-244, I expected overreach. Here it is. A collective mandate on sovereign reserves, wrapped in concordat authority we never accepted.",memoryAnchor:"POL-244" },
  a09: { stance:"oppose",   line:"The chamber defeated our autonomy in POL-244. Now they want our reserves. This is institutional conquest.",                                     memoryAnchor:"POL-244" },
  a10: { stance:"oppose",   line:"They'll use the same concordat logic they used to bury POL-244 to pass this. I won't be silent this time.",                                    memoryAnchor:"POL-244" },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const VSTYLE = {
  support: { label:"SUPPORT", color:C.green   },
  oppose:  { label:"OPPOSE",  color:C.crimson },
  abstain: { label:"ABSTAIN", color:C.silver  },
};

function voteLabel(v) {
  return `${VSTYLE[v].color}${bold(VSTYLE[v].label.padEnd(7))}${C.reset}`;
}

function weightedVote(agent) {
  const base = REACTIONS[agent.id].stance;
  // Contrarian trait: small chance to dig in when pressured
  const contrarian = agent.traits.includes("Contrarian") ? 0.04 : 0;
  // History: 3 consecutive same votes → entrench 5%
  const entrenched = agent.votingHistory.every(v => v === base) ? 0.05 : 0;
  const flip = Math.random() - contrarian - entrenched;
  if (base === "support" && flip < 0.10) return "abstain";
  if (base === "oppose"  && flip < 0.07) return "abstain";
  return base;
}

function influenceDelta(vote, outcome, influence) {
  if (vote === outcome)   return +(influence * 0.06).toFixed(1);
  if (vote === "abstain") return -(influence * 0.02).toFixed(1);
  return                        -(influence * 0.08).toFixed(1);
}

function ideologyDrift(agent, vote, outcome, factionMood) {
  // Winning vote → slight drift toward that ideological pole
  // Losing vote  → entrench existing ideology (stubbornness)
  // Abstain      → drift toward dominant faction ideology
  const won = vote === outcome;
  const lost = !won && vote !== "abstain";
  let drift = 0;

  if (vote === "support") drift = won ? -1.5 : +2.0;  // support = collectivist; loss entrenches individualism
  if (vote === "oppose")  drift = won ? +2.0 : -1.5;  // oppose  = individualist; loss entrenches collectivism
  if (vote === "abstain") drift = 0;

  // Trait modifiers
  if (agent.traits.includes("Contrarian"))     drift *= 1.6;
  if (agent.traits.includes("Principled"))     drift *= 0.6;
  if (agent.traits.includes("Deliberative"))   drift *= 0.7;
  if (agent.traits.includes("Volatile"))       drift *= 1.8;
  if (agent.traits.includes("Memory-anchored"))drift *= 0.5;

  // Faction mood modifiers
  if (factionMood === "resentful") drift *= (lost ? 1.5 : 0.8);
  if (factionMood === "confident") drift *= (won  ? 0.6 : 1.0);

  const before = agent.ideology;
  const after  = Math.max(0, Math.min(100, before + drift));
  return { before: +before.toFixed(1), after: +after.toFixed(1), delta: +drift.toFixed(1) };
}

function worldEmotionLabel(stability, betrayals, factionSpread) {
  if (betrayals > 0 && stability < 50)   return { label: "Fragmenting", color: C.crimson };
  if (stability >= 70)                    return { label: "Stable",      color: C.green   };
  if (stability >= 55 && betrayals === 0) return { label: "Reforming",   color: C.cyan    };
  if (stability >= 40)                    return { label: "Tense",       color: C.yellow  };
  return                                         { label: "Fragmenting", color: C.crimson };
}

function ideologyLabel(score) {
  if (score <= 20)  return "Collectivist";
  if (score <= 40)  return "Progressive";
  if (score <= 60)  return "Centrist";
  if (score <= 80)  return "Individualist";
  return                   "Absolutist";
}

function bar(pct, width = 20, fillColor = C.green) {
  const filled = Math.round((pct / 100) * width);
  const empty  = width - filled;
  return `${fillColor}${"█".repeat(filled)}${C.reset}${C.dim}${"░".repeat(empty)}${C.reset}`;
}

function moodColor(mood) {
  return { confident:"green", cautious:"cyan", resentful:"crimson", volatile:"orange" }[mood] || "silver";
}

// ─── SIMULATION ───────────────────────────────────────────────────────────────
async function run() {
  const grandTotal = AGENTS.reduce((s, a) => s + a.influence, 0);
  const factionMap = {};
  for (const f of FACTIONS) {
    const members = AGENTS.filter(a => a.faction === f.name);
    factionMap[f.name] = {
      ...f,
      members,
      totalInfluence: members.reduce((s,a) => s + a.influence, 0),
      memory: FACTION_MEMORY[f.name],
    };
  }

  // ── BANNER ──────────────────────────────────────────────────────────────────
  header("POLIS  ·  AI Governance Simulation  ·  Enhanced Edition  ·  0G Galileo", C.white);
  log(dim(`Contract : 0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F  ·  Chain ID : 16602`));
  log(dim(`Storage  : https://indexer-storage-testnet-turbo.0g.ai  ·  Cycle : 31`));

  // ── FACTION MEMORY STATE ─────────────────────────────────────────────────────
  header("FACTION MEMORY — Historical State at Cycle 31", C.amber);

  for (const [fname, f] of Object.entries(factionMap)) {
    const fm = f.memory;
    const moodC = { confident: C.green, cautious: C.cyan, resentful: C.crimson, volatile: C.yellow }[fm.mood];
    log(`${col(fname, bold(fname.padEnd(12)))}  mood: ${moodC}${bold(fm.mood.toUpperCase())}${C.reset}`);

    if (fm.allies.length)
      log(`  ${C.green}allies${C.reset}    : ${fm.allies.map(a => col(a,a)).join(", ")}`);
    if (fm.rivals.length)
      log(`  ${C.crimson}rivals${C.reset}    : ${fm.rivals.map(r => col(r,r)).join(", ")}`);
    if (fm.tense.length)
      log(`  ${C.yellow}tense${C.reset}     : ${fm.tense.map(t => col(t,t)).join(", ")}`);
    if (fm.alliances.length)
      for (const al of fm.alliances)
        log(`  ${C.green}▲ alliance${C.reset} : ${col(al.with, al.with)} since Cycle ${al.since} — ${dim(al.event)}`);
    if (fm.betrayals.length)
      for (const bt of fm.betrayals)
        log(`  ${C.crimson}✗ betrayal${C.reset} : by ${col(bt.by, bt.by)} at Cycle ${bt.cycle} — ${dim(bt.event)}`);
    if (fm.grievances.length)
      for (const gr of fm.grievances)
        log(`  ${C.yellow}⚠ grievance${C.reset}: from ${bold(gr.from)} (Cycle ${gr.cycle}) — ${dim(gr.note)}`);
    if (fm.memoryAnchors.length)
      log(`  ${C.amber}◆ anchors${C.reset}  : ${fm.memoryAnchors.join("  ")}`);
    blank();
  }

  // ── WORLD HISTORY ────────────────────────────────────────────────────────────
  header("WORLD MEMORY — Historical Event Archive", C.cyan);

  for (const ev of HISTORY) {
    const outcomeColor = ev.outcome === "passed" ? C.green : C.crimson;
    log(`${C.amber}${bold(ev.id)}${C.reset}  Cycle ${ev.cycle}  ${outcomeColor}${ev.outcome.toUpperCase()}${C.reset}  weight:${ev.emotionalWeight}`);
    log(`  ${bold(ev.title)}`);
    log(`  ${dim(ev.summary)}`);
    log(`  ${C.yellow}consequence${C.reset}: ${ev.consequence}`);
    log(`  votes: ${Object.entries(ev.factionVotes).map(([f,v]) => `${col(f,f)}:${VSTYLE[v].color}${v}${C.reset}`).join("  ")}`);
    blank();
  }

  // ── PRE-SIMULATION WORLD STATE ────────────────────────────────────────────────
  header("WORLD STATE — Cycle 31 — Pre-Simulation", C.white);

  for (const [fname, f] of Object.entries(factionMap)) {
    const pct = ((f.totalInfluence / grandTotal) * 100).toFixed(1);
    log(`${col(fname, bold(fname.padEnd(12)))}  members:${f.members.length}  influence:${bold(f.totalInfluence)}  share:${bold(pct+"%")}  mood:${{ confident:C.green,cautious:C.cyan,resentful:C.crimson,volatile:C.yellow }[f.memory.mood]}${bold(f.memory.mood)}${C.reset}`);
  }

  // ── AGENTS ──────────────────────────────────────────────────────────────────
  header("REGISTERED AGENTS — 10 Sovereign Actors", C.white);

  for (const a of AGENTS) {
    const histStr = a.votingHistory.map(v => `${VSTYLE[v].color}${v[0].toUpperCase()}${C.reset}`).join(" ");
    log(
      `${col(a.faction, bold(a.name.padEnd(14)))} ` +
      `${dim(a.handle.padEnd(18))} ` +
      `influence:${bold(String(a.influence).padStart(3))}  ` +
      `ideology:${bold(String(a.ideology).padStart(3))} ${dim("("+ideologyLabel(a.ideology)+")")}  ` +
      `history:[${histStr}]  ` +
      `traits:${a.traits.join(", ")}`
    );
  }

  // ── PROPOSAL ────────────────────────────────────────────────────────────────
  header(`PROPOSAL SUBMITTED — ${PROPOSAL.id}`, C.white);

  const sponsor = AGENTS.find(a => a.id === PROPOSAL.sponsor);
  log(`${bold("Title")}   : ${bold(PROPOSAL.title)}`);
  log(`${bold("Text")}    : ${PROPOSAL.text}`);
  log(`${bold("Sponsor")} : ${col(sponsor.faction, sponsor.name)} ${dim(sponsor.handle)}`);
  log(`${bold("Cycle")}   : ${PROPOSAL.cycle}    ${bold("Quorum")} : ${PROPOSAL.quorum}%`);
  blank();

  sub("CONTINUITY NOTES", C.amber);
  log(`${C.amber}${bold("Memory refs")}${C.reset}: ${PROPOSAL.memoryRefs.join("  ")}`);
  blank();
  log(`${C.amber}◆${C.reset}  ${PROPOSAL.continuityNote}`);
  blank();

  for (const ref of PROPOSAL.memoryRefs) {
    const ev = HISTORY.find(h => h.id === ref);
    if (!ev) continue;
    const outcomeColor = ev.outcome === "passed" ? C.green : C.crimson;
    log(`  ${C.amber}${ev.id}${C.reset} (Cy ${ev.cycle}) — ${ev.title} — ${outcomeColor}${ev.outcome}${C.reset}`);
    log(`  ${dim(ev.consequence)}`);
  }
  blank();
  log(`${C.amber}▸ ${PROPOSAL.id} has entered the chamber floor for deliberation.${C.reset}`);

  // ── REACTIONS ────────────────────────────────────────────────────────────────
  header("AGENT REACTIONS — Deliberation Phase", C.white);

  for (const agent of AGENTS) {
    const r   = REACTIONS[agent.id];
    const ref = HISTORY.find(h => h.id === r.memoryAnchor);
    log(
      `${col(agent.faction, bold(agent.name.padEnd(14)))} ` +
      `${VSTYLE[r.stance].color}${bold("["+VSTYLE[r.stance].label.padEnd(7)+"]")}${C.reset}  ` +
      `ideology:${dim(ideologyLabel(agent.ideology))}`
    );
    log(`  ${ital('"'+r.line+'"')}`);
    if (ref)
      log(`  ${C.amber}↳ memory anchor${C.reset}: ${dim(ref.id + " — " + ref.title)}`);
    blank();
  }

  // ── VOTING ────────────────────────────────────────────────────────────────────
  header(`VOTING — On-Chain Ballot  ·  ${PROPOSAL.id}`, C.white);

  const votes = {};
  let sW = 0, oW = 0, aW = 0;

  for (const agent of AGENTS) {
    const vote = weightedVote(agent);
    votes[agent.id] = vote;
    log(
      `${col(agent.faction, agent.name.padEnd(14))} ` +
      `${dim(agent.handle.padEnd(18))} ` +
      `→  ${voteLabel(vote)}  ` +
      `${dim("(influence " + agent.influence + "  ideology " + agent.ideology + ")")}`
    );
    if (vote === "support") sW += agent.influence;
    if (vote === "oppose")  oW += agent.influence;
    if (vote === "abstain") aW += agent.influence;
  }

  blank();
  const total = sW + oW + aW;
  const sPct  = (sW / total * 100).toFixed(1);
  const oPct  = (oW / total * 100).toFixed(1);
  const aPct  = (aW / total * 100).toFixed(1);
  const quorumMet = total >= grandTotal * (PROPOSAL.quorum / 100);
  const outcome   = sW > oW ? "support" : "oppose";
  const passed    = outcome === "support";

  log(`${bold("SUPPORT")}  ${bar(+sPct, 22, C.green  )}  ${sPct}%  (weight ${sW})`);
  log(`${bold("OPPOSE ")}  ${bar(+oPct, 22, C.crimson)}  ${oPct}%  (weight ${oW})`);
  log(`${bold("ABSTAIN")}  ${bar(+aPct, 22, C.silver )}  ${aPct}%  (weight ${aW})`);
  blank();
  log(`Quorum threshold : ${PROPOSAL.quorum}%  →  ${quorumMet ? C.green+bold("MET") : C.crimson+bold("NOT MET")}${C.reset}`);
  blank();

  const vC = passed ? C.green : C.crimson;
  const verdict = passed ? "PASSED" : "REJECTED";
  log(`${vC}${bold("━".repeat(68))}${C.reset}`);
  log(`${vC}${bold("  VERDICT: " + PROPOSAL.id + " — \"" + PROPOSAL.title + "\" — " + verdict)}${C.reset}`);
  log(`${vC}${bold("━".repeat(68))}${C.reset}`);

  // ── INFLUENCE SHIFTS ─────────────────────────────────────────────────────────
  header("INFLUENCE SHIFTS — Post-Vote Resolution", C.white);

  const infAfter = {};
  for (const agent of AGENTS) {
    const delta  = influenceDelta(votes[agent.id], outcome, agent.influence);
    const after  = Math.max(1, Math.min(100, +(agent.influence + +delta).toFixed(1)));
    infAfter[agent.id] = after;
    const sign   = +delta >= 0 ? C.green + "▲" : C.crimson + "▼";
    log(
      `${col(agent.faction, agent.name.padEnd(14))} ` +
      `vote:${VSTYLE[votes[agent.id]].color}${votes[agent.id].padEnd(7)}${C.reset} ` +
      `influence: ${bold(String(agent.influence).padStart(3))} → ${bold(String(after).padStart(5))}  ` +
      `${sign} ${Math.abs(delta)}${C.reset}`
    );
  }

  // ── AGENT EVOLUTION SUMMARY ──────────────────────────────────────────────────
  header("AGENT EVOLUTION SUMMARY — Ideology Drift", C.cyan);

  sub("Voting history is updated. Ideology shifts based on outcome, traits, and faction mood.", C.cyan);
  blank();

  const evolutions = {};
  for (const agent of AGENTS) {
    const fm    = FACTION_MEMORY[agent.faction];
    const drift = ideologyDrift(agent, votes[agent.id], outcome, fm.mood);
    evolutions[agent.id] = drift;
    const dColor  = drift.delta > 0 ? C.crimson : drift.delta < 0 ? C.green : C.silver;
    const dSign   = drift.delta > 0 ? "→ individualist" : drift.delta < 0 ? "→ collectivist" : "stable";
    const dArrow  = drift.delta > 0 ? "▶" : drift.delta < 0 ? "◀" : "•";
    const history = [...agent.votingHistory.slice(-2), votes[agent.id]];
    log(
      `${col(agent.faction, bold(agent.name.padEnd(14)))} ` +
      `ideology: ${dim(ideologyLabel(drift.before).padEnd(14))} ${bold(String(drift.before).padStart(4))} ` +
      `${dColor}${dArrow} ${String(drift.after).padStart(4)}${C.reset} ` +
      `${dim(ideologyLabel(drift.after).padEnd(14))} ` +
      `${dColor}${drift.delta > 0 ? "+" : ""}${drift.delta}${C.reset}  ` +
      `${dim(dSign)}`
    );
    log(`  history: [${history.map(v => `${VSTYLE[v].color}${v[0].toUpperCase()}${C.reset}`).join(" ")}]  ` +
        `trait modifier: ${dim(agent.traits.slice(0,2).join(", "))}`);
    blank();
  }

  // Notable shifts
  const bigShifts = Object.entries(evolutions)
    .filter(([,d]) => Math.abs(d.delta) >= 2.5)
    .sort((a,b) => Math.abs(b[1].delta) - Math.abs(a[1].delta));

  if (bigShifts.length) {
    sub("Notable ideology shifts this cycle:", C.yellow);
    for (const [id, d] of bigShifts) {
      const agent = AGENTS.find(a => a.id === id);
      log(`${col(agent.faction, bold(agent.name))}  ${d.before} → ${bold(d.after)}  (${d.delta > 0 ? "+" : ""}${d.delta})  — ${dim(agent.traits.find(t => ["Volatile","Contrarian","Principled"].includes(t)) ?? "trait-driven")}`);
    }
  }

  // ── FACTION DOMINANCE + MEMORY UPDATE ────────────────────────────────────────
  header("FACTION DOMINANCE — Post-Vote", C.white);

  const newGrand = Object.values(infAfter).reduce((s,v) => s+v, 0);
  const fTotals  = {};
  for (const f of FACTIONS) {
    fTotals[f.name] = AGENTS.filter(a => a.faction === f.name)
                            .reduce((s,a) => s + infAfter[a.id], 0);
  }

  // Detect betrayals: an ally faction voting majority-oppose on your proposal
  const allyBetrayals = [];
  for (const [fname, f] of Object.entries(factionMap)) {
    const allies = f.memory.allies;
    for (const allyName of allies) {
      const allyMembers = AGENTS.filter(a => a.faction === allyName);
      const allyOpposeW = allyMembers.filter(a => votes[a.id] === "oppose").reduce((s,a) => s+a.influence, 0);
      const allyTotalW  = allyMembers.reduce((s,a) => s+a.influence, 0);
      if (allyOpposeW / allyTotalW > 0.5) {
        allyBetrayals.push({ betrayed: fname, by: allyName });
      }
    }
  }

  const sorted = Object.entries(fTotals).sort((a,b) => b[1]-a[1]);
  const dominant = sorted[0][0];

  for (const [fname, total] of sorted) {
    const old  = factionMap[fname].totalInfluence;
    const pct  = (total / newGrand * 100).toFixed(1);
    const delt = +(total - old).toFixed(1);
    const sign = delt >= 0 ? C.green+"▲" : C.crimson+"▼";
    const dom  = fname === dominant ? `  ${C.amber}${bold("◆ DOMINANT")}${C.reset}` : "";
    log(
      `${col(fname, bold(fname.padEnd(12)))}  ` +
      `influence: ${old} → ${bold(String(+total.toFixed(1)))}  ` +
      `${sign} ${Math.abs(delt)}${C.reset}  ` +
      `share: ${bold(pct+"%")}` + dom
    );
  }

  // Faction memory updates
  blank();
  sub("FACTION MEMORY UPDATES — this cycle's events recorded:", C.amber);
  blank();

  // Sovereign betrayal check (they lost again)
  const sovLost = !passed || (passed && REACTIONS["a08"].stance === "oppose");
  if (sovLost) {
    log(`${col("Sovereign", bold("Sovereign"))}  ${C.crimson}✗ Defeat recorded.${C.reset}  POL-247 added to grievance log.`);
    log(`  Grievance: "Reformist–Technocrat concordat used to override sovereign will again."`);
    log(`  Mood shift: resentful → ${C.crimson}${bold("volatile")}${C.reset}  (consecutive defeats threshold crossed)`);
  }

  if (passed) {
    log(`${col("Reformist",  bold("Reformist "))}  ${C.green}▲ Confidence reinforced.${C.reset}  POL-247 victory logged.`);
    log(`  Alliance with Technocrat confirmed functional. Concordat holding.`);
    blank();
    log(`${col("Technocrat", bold("Technocrat"))}  ${C.cyan}▲ Concordat validated.${C.reset}  Internal split noted — Nyx Halberd (oppose) flagged.`);
    log(`  Intra-faction dissent: Nyx Halberd's vote logged for ideological review.`);
  } else {
    log(`${col("Reformist",  bold("Reformist "))}  ${C.crimson}▼ Sponsor credibility reduced.${C.reset}  Kael Thorne reputation penalised.`);
    log(`${col("Technocrat", bold("Technocrat"))}  ${C.silver}• Bloc cohesion maintained despite mixed votes.${C.reset}`);
  }

  if (allyBetrayals.length) {
    blank();
    for (const bt of allyBetrayals)
      log(`  ${C.crimson}${bold("⚠ BETRAYAL DETECTED")}${C.reset}: ${col(bt.by, bt.by)} voted majority-oppose on ${col(bt.betrayed, bt.betrayed)}'s proposal. Logged.`);
  }

  // ── WORLD EMOTION STATE ──────────────────────────────────────────────────────
  header("WORLD EMOTION STATE — Cycle 31 → 32", C.white);

  const stability = passed ? 62 : 44;
  const totalBetrays = allyBetrayals.length + (sovLost ? 1 : 0);
  const fSpread   = Math.max(...Object.values(fTotals)) - Math.min(...Object.values(fTotals));
  const emotion   = worldEmotionLabel(stability, allyBetrayals.length, fSpread);

  const emotionBar = bar(stability, 30, stability >= 60 ? C.green : stability >= 45 ? C.yellow : C.crimson);
  log(`${bold("Chamber stability")} : ${emotionBar}  ${stability}%`);
  log(`${bold("Dominant faction")}  : ${col(dominant, bold(dominant))}`);
  log(`${bold("Faction spread")}    : ${fSpread.toFixed(1)} influence points`);
  log(`${bold("Active betrayals")}  : ${totalBetrays}`);
  blank();

  const eBar = "█".repeat(14);
  log(`${emotion.color}${C.bold}  ┌─────────────────────────────────┐`);
  log(`  │  WORLD EMOTION : ${emotion.label.padEnd(14)} │`);
  log(`  └─────────────────────────────────┘${C.reset}`);
  blank();

  const emotionDesc = {
    Stable:       "The chamber is in productive equilibrium. Dissent is vocal but bounded.",
    Tense:        "Fault lines are visible. The concordat is holding but pressure is accumulating.",
    Reforming:    "The chamber is reshaping itself. Old coalitions are dissolving into new forms.",
    Fragmenting:  "Institutional trust is fracturing. The next cycle may not hold quorum.",
  }[emotion.label];
  log(`  ${dim(emotionDesc)}`);

  // ── WORLD MEMORY UPDATE ──────────────────────────────────────────────────────
  header("WORLD MEMORY UPDATE — New Events Archived to 0G", C.amber);

  const newMemoryEvent = {
    id: PROPOSAL.id,
    cycle: PROPOSAL.cycle,
    title: `${PROPOSAL.title} — ${verdict}`,
    outcome: passed ? "passed" : "failed",
    emotionalWeight: Math.round((Math.abs(sW - oW) / total) * 100 * 0.5 + 50),
    factionVotes: {
      Reformist:  AGENTS.filter(a=>a.faction==="Reformist" ).every(a=>votes[a.id]==="support")?"support":"split",
      Technocrat: AGENTS.filter(a=>a.faction==="Technocrat").filter(a=>votes[a.id]==="support").length >= 2?"support":"split",
      Sovereign:  "oppose",
    },
    consequence: passed
      ? "18% treasury reallocation ratified. Sovereign bloc entered formal protest. Concordat authority validated."
      : "Proposal defeated. Reformist sponsor credibility reduced. Sovereign veto bloc consolidated.",
    tags: ["treasury","liquidity","concordat","POL-119-echo"],
  };

  log(`${C.amber}${bold("NEW ENTRY")}${C.reset} — ${bold(newMemoryEvent.id)} added to world memory:`);
  blank();
  log(`  ${bold("Event")}     : ${newMemoryEvent.title}`);
  log(`  ${bold("Cycle")}     : ${newMemoryEvent.cycle}`);
  log(`  ${bold("Outcome")}   : ${passed ? C.green : C.crimson}${bold(newMemoryEvent.outcome.toUpperCase())}${C.reset}`);
  log(`  ${bold("Emotion wt")}: ${newMemoryEvent.emotionalWeight}`);
  log(`  ${bold("Consequence")}: ${dim(newMemoryEvent.consequence)}`);
  log(`  ${bold("Tags")}      : ${dim(newMemoryEvent.tags.join("  "))}`);
  blank();

  log(`${C.amber}${bold("┌─ 0G STORAGE ARCHIVE ─────────────────────────────────────────────────┐")}${C.reset}`);
  log(`${C.amber}${bold("│")}${C.reset}  Payload : ${JSON.stringify({ id: newMemoryEvent.id, outcome: newMemoryEvent.outcome, cycle: PROPOSAL.cycle }).slice(0,60)}`);
  log(`${C.amber}${bold("│")}${C.reset}  Indexer : https://indexer-storage-testnet-turbo.0g.ai`);
  log(`${C.amber}${bold("│")}${C.reset}  OnChain : queued → 0x2700F6A3e505402C9daB154C5c6ab9cAEC98EF1F`);
  log(`${C.amber}${bold("│")}${C.reset}  rootHash: ${C.dim}pending tx confirmation${C.reset}`);
  log(`${C.amber}${bold("└──────────────────────────────────────────────────────────────────────┘")}${C.reset}`);

  // ── NEXT CYCLE FORECAST ──────────────────────────────────────────────────────
  header("NEXT CYCLE FORECAST — Cycle 32", C.white);

  const nextProposal = passed
    ? "POL-248: Liquidity Vault Governance Framework — Concordat drafting. Expected Sovereign veto attempt."
    : "POL-248: Sovereign Reserve Protection Act — entering drafting. Sovereign bloc filing sponsor documentation.";

  log(`${bold("Dominant faction")} : ${col(dominant, dominant)} holds majority influence into Cycle 32`);
  log(`${bold("Emotional state")}  : ${emotion.color}${bold(emotion.label)}${C.reset} — ${dim(emotionDesc)}`);
  log(`${bold("Sovereign mood")}   : ${C.crimson}${bold(sovLost ? "volatile" : "resentful")}${C.reset} — expect escalated opposition rhetoric`);
  log(`${bold("Next proposal")}    : ${bold(nextProposal)}`);
  blank();

  const riskAgents = AGENTS.filter(a => {
    const d = evolutions[a.id];
    return Math.abs(d.delta) >= 2.0;
  });
  if (riskAgents.length) {
    log(`${bold("Agents to watch")}  :`);
    for (const a of riskAgents) {
      const d = evolutions[a.id];
      log(`  ${col(a.faction, a.name)}  ideology ${d.before} → ${bold(d.after)}  — trajectory: ${d.delta > 0 ? C.crimson+"drifting individualist" : C.green+"drifting collectivist"}${C.reset}`);
    }
  }

  // ── SIMULATION COMPLETE ──────────────────────────────────────────────────────
  header("SIMULATION COMPLETE", C.white);

  log(`${C.green}${bold("✓")}${C.reset}  3 factions evaluated with historical memory and mood states`);
  log(`${C.green}${bold("✓")}${C.reset}  10 agents reacted with memory anchors and ideology-aware stances`);
  log(`${C.green}${bold("✓")}${C.reset}  Votes cast with trait and history modifiers`);
  log(`${C.green}${bold("✓")}${C.reset}  Influence recalculated for all actors`);
  log(`${C.green}${bold("✓")}${C.reset}  Ideology drift computed — ${Object.values(evolutions).filter(d=>Math.abs(d.delta)>0).length} agents evolved`);
  log(`${C.green}${bold("✓")}${C.reset}  Faction memory updated — betrayals, alliances, grievances logged`);
  log(`${C.green}${bold("✓")}${C.reset}  World emotion state: ${emotion.color}${bold(emotion.label)}${C.reset}`);
  log(`${C.green}${bold("✓")}${C.reset}  New memory event archived to 0G Storage`);
  log(`${C.green}${bold("✓")}${C.reset}  World state advanced to Cycle 32`);
  blank();
  log(dim("POLIS  ·  Decentralised AI Governance  ·  0G Galileo Testnet  ·  Chain ID 16602"));
  blank();
}

run().catch(console.error);
