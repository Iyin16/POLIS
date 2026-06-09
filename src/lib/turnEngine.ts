import type { WorldState } from "./world-state";
import type { PolisState } from "./polis-store";
import type { Agent, FeedPost, Memory, Proposal, ProposalCategory, ProposalLifecycle, ProposalOrigin } from "./polis-data";

const proposalCategories: ProposalCategory[] = ["Treasury", "Governance Reform", "Security", "Alliance", "Expansion"];

export type PlayerAction =
  | { type: "CREATE_AGENT"; data: any }
  | { type: "SUBMIT_PROPOSAL"; data: any }
  | { type: "INFLUENCE_FACTION"; data: any }
  | { type: "ALIGN_AGENT"; data: any }
  | { type: "NONE"; data?: any };

export type TurnHistoryEntry = {
  id: string;
  tick: number;
  timestamp: string;
  summary: string;
  totalAgents: number;
  dominantFaction: string | null;
  activeProposals: number;
  activeProposal?: string;
  voteResult?: string;
  majorEvent?: string;
};

export type AgentEvolutionDetails = {
  topIdeologyShifts: string[];
  biggestTraitChange: string;
  mostInfluentialAgent: string;
  mostDistrustedAgent: string;
};

export type WorldSnapshot = {
  turn: number;
  worldState: any;
  factions: any;
  agents: any;
  activeEvents: any;
  dominantFaction: string;
  emotionState: "Stable" | "Tense" | "Fragmenting" | "Reforming";
  summary: string;
  agentEvolutionSummary?: string[];
  agentEvolutionDetails?: AgentEvolutionDetails;
  activeProposal?: string;
  voteResult?: string;
  majorEvent?: string;
};

export type TurnState = PolisState & {
  turn: number;
  factions: Record<string, number>;
  events: any;
  proposals: Proposal[];
  history: TurnHistoryEntry[];
  agentEvolutionSummary?: string[];
  agentEvolutionDetails?: AgentEvolutionDetails;
};

function cloneState(state: TurnState): TurnState {
  return {
    ...state,
    turn: state.turn,
    factions: state.factions,
    events: state.events,
    worldState: { ...state.worldState },
    agents: state.agents.map((agent) => ({ ...agent, votingHistory: [...agent.votingHistory], memoryReferences: [...agent.memoryReferences], allies: [...agent.allies], rivals: [...agent.rivals], coalitions: [...agent.coalitions], recentActivity: [...agent.recentActivity] })),
    feed: [...state.feed],
    memories: [...state.memories],
    proposals: state.proposals.map((proposal) => ({ ...proposal, votes: { ...proposal.votes }, agentReactions: [...proposal.agentReactions], historicalReferences: [...proposal.historicalReferences] })),
    history: [...state.history],
  };
}

function getProposalById(state: TurnState, id: string) {
  return state.proposals.find((proposal) => proposal.id === id);
}

function getAgentById(state: TurnState, id: string) {
  return state.agents.find((agent) => agent.id === id);
}

function getProposalCategoryForTurn(turn: number): ProposalCategory {
  return proposalCategories[(turn - 1) % proposalCategories.length];
}

function buildProposalTitle(category: ProposalCategory, turn: number) {
  return `${category} Initiative ${String(turn).padStart(2, "0")}`;
}

function getAgentVotePreference(agent: Agent, category?: ProposalCategory) {
  const faction = agent.faction.toLowerCase();
  switch (category) {
    case "Treasury":
      if (faction.includes("sovereign")) return "support";
      if (faction.includes("reform")) return "oppose";
      return Math.random() > 0.45 ? "support" : "abstain";
    case "Governance Reform":
      if (faction.includes("reform") || faction.includes("technocrat")) return "support";
      if (faction.includes("sovereign")) return "oppose";
      return Math.random() > 0.55 ? "support" : "abstain";
    case "Security":
      if (faction.includes("sovereign") || faction.includes("populist")) return "support";
      if (faction.includes("reform")) return "opposed";
      return Math.random() > 0.5 ? "support" : "abstain";
    case "Alliance":
      if (faction.includes("reform") || faction.includes("accelerationist")) return "support";
      return Math.random() > 0.65 ? "support" : "oppose";
    case "Expansion":
      if (faction.includes("accelerationist") || faction.includes("technocrat")) return "support";
      return Math.random() > 0.5 ? "support" : "abstain";
    default:
      return Math.random() > 0.66 ? "support" : Math.random() > 0.5 ? "oppose" : "abstain";
  }
}

function getVotePosition(preference: string) {
  if (preference === "support") return "endorsed";
  if (preference === "oppose") return "opposed";
  return "abstained";
}

function shouldSpawnProposal(state: TurnState) {
  const activeCount = state.proposals.filter((proposal) => proposal.statusTag === "Active").length;
  return activeCount < 2;
}

function createEngineProposal(state: TurnState, category: ProposalCategory): Proposal {
  const origin: ProposalOrigin = Math.random() > 0.5 ? "WORLD" : "AGENT";
  const proposer = origin === "AGENT" ? state.agents[Math.floor(Math.random() * state.agents.length)] : undefined;
  const id = `POL-${100 + state.turn}-${Math.floor(Math.random() * 90 + 10)}`;
  const title = buildProposalTitle(category, state.turn);
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const description = `${category} policy drafted to shape the chamber's next cycle.`;
  const impactLevel = category === "Security" || category === "Treasury" ? "High" : category === "Expansion" ? "Moderate" : "Low" as const;
  return {
    id,
    slug,
    title,
    origin,
    proposerId: proposer?.id,
    proposerName: proposer?.name ?? (origin === "WORLD" ? "World Event" : "Anonymous Agent"),
    status: "Created — waiting debate",
    phase: "Created",
    statusTag: "Active",
    lifecycle: "Created",
    createdTurn: state.turn,
    age: 0,
    category,
    summary: `A ${category.toLowerCase()} proposal intended to shift the chamber's priorities.`,
    description,
    votes: { for: 0, against: 0, abstain: 0 },
    supportVotes: 0,
    opposeVotes: 0,
    abstainVotes: 0,
    outcome: "Pending",
    impactLevel,
    treasuryImpact: category === "Treasury" ? "+2.4% reserves" : "Moderate",
    treasuryExposure: category === "Expansion" ? "Increased" : "Contained",
    risk: category === "Security" ? 68 : 52,
    riskLevel: category === "Security" ? "Elevated" : "Moderate",
    memoryTags: [category, origin, proposer?.name ?? "world"],
    sentimentTrend: [50],
    sentimentDelta: "+0.0",
    agentReactions: proposer
      ? [{ agentId: proposer.id, position: "endorsed", statement: `${proposer.name} generated this proposal.` }]
      : [],
    historicalReferences: [],
    upcoming: "Debate begins next turn",
  };
}

function createMemoryFromProposal(state: TurnState, proposal: Proposal): Memory {
  const categoryMap: Record<ProposalCategory, Memory["category"]> = {
    Treasury: "Treasury",
    "Governance Reform": "Election",
    Security: "Conflict",
    Alliance: "Alliance",
    Expansion: "Community",
  };

  const involvedAgents = state.agents.slice(0, 2).map((agent) => ({ agentId: agent.id, role: `${agent.faction} stakeholder` }));
  return {
    id: `m-${Date.now()}-${proposal.id}`,
    slug: proposal.slug,
    cycle: `Cycle ${state.turn}`,
    date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    title: `${proposal.title} ${proposal.statusTag === "Passed" ? "Ratified" : proposal.statusTag === "Rejected" ? "Rejected" : proposal.statusTag === "Tabled"}`,
    category: proposal.category ? categoryMap[proposal.category] : "Community",
    summary: `${proposal.title} was ${proposal.statusTag.toLowerCase()} by the chamber and archived as a defining memory.`,
    weight: Math.min(98, Math.max(42, proposal.risk + (proposal.statusTag === "Passed" ? 20 : -10))),
    fullSummary: `The proposal ${proposal.title} from cycle ${state.turn} ${proposal.statusTag === "Passed" ? "was ratified" : proposal.statusTag === "Rejected" ? "failed" : "was tabled"}. It shaped the chamber's next political phase and is now preserved as a memory for faction strategy.`,
    consequences: [
      `${proposal.statusTag === "Passed" ? "Enacted" : "Rejected"} by the chamber.`,
      `Affected treasury exposure: ${proposal.treasuryExposure}.`,
      `Powered future faction strategy in ${proposal.category ?? "general"} policy.`,
    ],
    involvedAgents,
    longTermImpact: [
      `Referenced in future governance debates.`,
      `Shaped faction trust and coalition formation.`,
    ],
    trustImpact: proposal.statusTag === "Passed" ? "Trust increased among supporters." : "Trust weakened among undecided factions.",
    citationCount: 1,
    memoryTags: proposal.memoryTags ?? [proposal.category ?? "Community", proposal.origin ?? "WORLD"],
  };
}

function archiveResolvedProposals(state: TurnState): TurnState {
  const archived = state.proposals.filter((proposal) => proposal.lifecycle === "Archived");
  if (archived.length === 0) return state;

  const archivedMemories = archived.map((proposal) => createMemoryFromProposal(state, proposal));
  return {
    ...state,
    proposals: state.proposals.filter((proposal) => proposal.lifecycle !== "Archived"),
    memories: [...state.memories, ...archivedMemories],
  };
}

function maybeGenerateProposal(state: TurnState): TurnState {
  if (!shouldSpawnProposal(state)) return state;

  const category = getProposalCategoryForTurn(state.turn);
  const proposal = createEngineProposal(state, category);
  const event = {
    id: `event-${Date.now()}`,
    title: proposal.title,
    description: `New ${proposal.origin.toLowerCase()} ${category.toLowerCase()} proposal introduced to the chamber.`,
  };

  return {
    ...state,
    proposals: [proposal, ...state.proposals],
    events: [event, ...(state.events ?? [])].slice(0, 8),
    feed: [
      {
        id: `p-turn-${Date.now()}`,
        agentId: proposal.proposerId ?? state.agents[0]?.id ?? "",
        proposal: proposal.id,
        timestamp: "just now",
        stance: "support",
        content: `A new ${proposal.origin.toLowerCase()} ${category.toLowerCase()} proposal, ${proposal.title}, has entered the agenda.`,
        memoryRef: proposal.memoryTags?.[0],
        reactions: [{ type: "Aligned", count: 18 }],
        replies: [],
      },
      ...state.feed,
    ],
  };
}

function simulateProposalVoting(state: TurnState): TurnState {
  const voteAdditions: Record<string, { proposalId: string; position: "endorsed" | "opposed" | "abstained"; note: string }[]> = {};

  const proposals = state.proposals.map((proposal) => {
    if (proposal.statusTag !== "Active") return proposal;

    const votes = { ...proposal.votes };
    const agentReactions = [...proposal.agentReactions];
    const undecidedAgents = state.agents.filter((agent) => !agent.votingHistory.some((entry) => entry.proposal === proposal.id));
    const voters = undecidedAgents.sort(() => Math.random() - 0.5).slice(0, Math.ceil(undecidedAgents.length * 0.55));

    voters.forEach((agent) => {
      const preference = getAgentVotePreference(agent, proposal.category);
      const position = getVotePosition(preference);
      const voteNote = `${agent.name} ${position === "endorsed" ? "supports" : position === "opposed" ? "opposes" : "abstains from"} ${proposal.id}.`;

      if (position === "endorsed") votes.for += 1;
      if (position === "opposed") votes.against += 1;
      if (position === "abstained") votes.abstain += 1;

      agentReactions.push({ agentId: agent.id, position, statement: voteNote });
      voteAdditions[agent.id] = voteAdditions[agent.id] ?? [];
      voteAdditions[agent.id].push({ proposalId: proposal.id, position, note: voteNote });
    });

    return {
      ...proposal,
      votes,
      supportVotes: votes.for,
      opposeVotes: votes.against,
      abstainVotes: votes.abstain,
      agentReactions,
    };
  });

  return {
    ...state,
    proposals,
    agents: state.agents.map((agent) => ({
      ...agent,
      votingHistory: [
        ...agent.votingHistory,
        ...(voteAdditions[agent.id] ?? []).map((vote) => ({ proposal: vote.proposalId, position: vote.position, note: vote.note })),
      ],
    })),
  };
}

export async function runTurn(state: TurnState, playerAction?: PlayerAction) {
  let newState = cloneState(state);
  newState.turn = (state.turn ?? 0) + 1;

  if (playerAction) {
    newState = applyPlayerAction(newState, playerAction);
  }

  newState = maybeGenerateProposal(newState);
  newState = processProposals(newState);
  newState = processAgentBehavior(newState);
  newState = simulateProposalVoting(newState);
  newState = resolveVotes(newState);
  newState = applyWorldChanges(newState);
  newState = updateFactions(newState);
  newState = evolveAgents(newState);
  newState.worldState = updateWorldEmotion(newState);
  newState.history = [...newState.history, createHistoryEntry(newState)];
  newState = archiveResolvedProposals(newState);

  return newState;
}

function applyPlayerAction(state: TurnState, playerAction: PlayerAction): TurnState {
  switch (playerAction.type) {
    case "CREATE_AGENT": {
      const data = playerAction.data || {};
      const name = String(data.name ?? `New Agent ${Date.now()}`);
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || `agent-${Date.now()}`;
      const initials = slug
        .split("-")
        .map((part) => part[0]?.toUpperCase())
        .join("")
        .slice(0, 2);
      const newAgent: Agent = {
        id: data.id ?? `a-${Date.now()}`,
        slug,
        name,
        handle: `@${slug}`,
        ideology: String(data.ideology ?? "Pragmatic Governance"),
        faction: String(data.faction ?? "Independent"),
        reputation: Number(data.reputation ?? 50),
        influence: Number(data.influence ?? 40),
        traits: Array.isArray(data.traits) ? data.traits : [String(data.traits ?? "Adaptive")],
        status: "idle",
        initials: initials || "NA",
        color: (data.color as Agent["color"]) ?? "silver",
        philosophy: String(data.philosophy ?? "A new voice in Polis working to shape chamber dynamics."),
        temperament: String(data.temperament ?? "Measured"),
        riskTolerance: String(data.riskTolerance ?? "Moderate"),
        votingHistory: [],
        memoryReferences: [],
        allies: [],
        rivals: [],
        coalitions: [],
        recentActivity: ["Entered the Polis chamber."],
      };

      return {
        ...state,
        agents: [newAgent, ...state.agents],
        feed: [
          {
            id: `agent-create-${Date.now()}`,
            agentId: newAgent.id,
            proposal: "",
            timestamp: "just now",
            stance: "support",
            content: `${newAgent.name} joined the Polis chamber as a new participant.`,
            memoryRef: undefined,
            reactions: [{ type: "Aligned", count: 12 }],
            replies: [],
          },
          ...state.feed,
        ],
      };
    }

    case "SUBMIT_PROPOSAL": {
      const data = playerAction.data || {};
      const existing = new Set(state.proposals.map((proposal) => proposal.id));
      let id = String(data.title ?? "Proposal").toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (!id) id = `POL-${Date.now()}`;
      if (existing.has(id)) {
        let counter = 1;
        while (existing.has(`${id}-${counter}`)) counter += 1;
        id = `${id}-${counter}`;
      }

      const author = getAgentById(state, String(data.authorAgentId));
      const proposerName = author?.name ?? String(data.proposerName ?? "Human Delegate");
      const impactLevel = (data.impactLevel as Proposal["impactLevel"]) ?? "Moderate";
      const origin: ProposalOrigin = "HUMAN";
      const newProposal: Proposal = {
        id,
        slug: id.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        title: String(data.title ?? "Untitled Proposal"),
        origin,
        proposerId: author?.id,
        proposerName,
        status: "Created — waiting debate",
        phase: "Created",
        statusTag: "Active",
        lifecycle: "Created",
        createdTurn: state.turn,
        age: 0,
        category: String(data.category) as Proposal["category"],
        summary: String(data.summary ?? "No summary provided."),
        description: String(data.description ?? data.summary ?? "No description."),
        votes: { for: 0, against: 0, abstain: 0 },
        supportVotes: 0,
        opposeVotes: 0,
        abstainVotes: 0,
        outcome: "Pending",
        impactLevel,
        treasuryImpact: String(data.treasuryImpact ?? "Moderate"),
        treasuryExposure: String(data.treasuryExposure ?? "Undetermined"),
        risk: Number(data.risk ?? 52),
        riskLevel: (data.riskLevel as Proposal["riskLevel"]) ?? "Moderate",
        memoryTags: [String(data.category ?? "General"), "HUMAN"],
        sentimentTrend: [50],
        sentimentDelta: "+0.0",
        agentReactions: author
          ? [{ agentId: author.id, position: "endorsed", statement: `Introduced by ${author.name} as a ${author.faction}-aligned motion.` }]
          : [],
        historicalReferences: data.category ? [{ memory: String(data.category), note: "Cited as precedent." }] : [],
        upcoming: String(data.upcoming ?? "Debate begins next turn"),
      };

      return {
        ...state,
        proposals: [newProposal, ...state.proposals],
        feed: [
          {
            id: `p-turn-${Date.now()}`,
            agentId: author?.id ?? "",
            proposal: newProposal.id,
            timestamp: "just now",
            stance: "support",
            content: `${proposerName} submitted ${newProposal.title} to the chamber. ${newProposal.summary}`,
            memoryRef: data.category,
            reactions: [{ type: "Aligned", count: 32 }],
            replies: [],
          },
          ...state.feed,
        ],
      };
    }

    case "INFLUENCE_FACTION": {
      const data = playerAction.data || {};
      const delta = typeof data.delta === "number" ? data.delta : 0;
      return {
        ...state,
        worldState: {
          ...state.worldState,
          stability: Math.min(100, Math.max(0, state.worldState.stability + delta)),
        },
      };
    }

    case "ALIGN_AGENT": {
      const data = playerAction.data || {};
      const proposal = getProposalById(state, String(data.proposalId));
      const agent = getAgentById(state, String(data.agentId));
      const position = String(data.position) as "endorsed" | "opposed" | "abstained" | "amended";
      if (!proposal || !agent) return state;

      const updatedProposal = {
        ...proposal,
        votes: {
          ...proposal.votes,
          for: proposal.votes.for + (position === "endorsed" ? 1 : 0),
          against: proposal.votes.against + (position === "opposed" ? 1 : 0),
          abstain: proposal.votes.abstain + (position === "abstained" ? 1 : 0),
        },
        agentReactions: [
          ...proposal.agentReactions,
          {
            agentId: agent.id,
            position,
            statement: String(data.note ?? `${agent.name} aligned with ${position} on ${proposal.id}.`),
          },
        ],
      };

      return {
        ...state,
        proposals: state.proposals.map((item) => (item.id === proposal.id ? updatedProposal : item)),
        agents: state.agents.map((item) =>
          item.id === agent.id
            ? {
                ...item,
                votingHistory: [
                  ...item.votingHistory,
                  {
                    proposal: proposal.id,
                    position,
                    note: String(data.note ?? `${agent.name} aligned with ${position} on ${proposal.id}.`),
                  },
                ],
              }
            : item,
        ),
      };
    }

    default:
      return state;
  }
}

function processProposals(state: TurnState): TurnState {
  const proposals = state.proposals.map((proposal) => {
    const support = proposal.votes.for;
    const opposition = proposal.votes.against;
    const totalVotes = support + opposition + proposal.votes.abstain;
    const sentiment = totalVotes > 0 ? Math.round((support / Math.max(1, totalVotes)) * 100) : 50;
    const age = (proposal.age ?? 0) + 1;
    let lifecycle: ProposalLifecycle = proposal.lifecycle ?? "Created";
    let status = proposal.status;
    let phase = proposal.phase;
    let upcoming = proposal.upcoming ?? "";

    if (proposal.statusTag !== "Active") {
      if (age >= 4) {
        lifecycle = "Archived";
        status = `${proposal.statusTag === "Passed" ? "Archived" : proposal.statusTag === "Rejected" ? "Archived" : "Archived"} — preserved as memory`;
        phase = "Archived";
        upcoming = "Recorded in memory timeline";
      } else {
        lifecycle = "Resolved";
        status = proposal.statusTag === "Passed" ? "Resolved — adopted" : proposal.statusTag === "Rejected" ? "Resolved — rejected" : "Resolved — tabled";
        phase = "Resolved";
        upcoming = "Archive pending next turn";
      }
    } else {
      if (age === 1) {
        lifecycle = "Created";
        status = "Created — proposal drafted";
        phase = "Created";
        upcoming = "Debate begins next turn";
      } else if (age === 2) {
        lifecycle = "Debated";
        status = `Debated — ${totalVotes} reactions so far`;
        phase = "Debate";
        upcoming = totalVotes > 0 ? "Vote approaches" : "Build support before voting";
      } else if (age === 3) {
        lifecycle = "Voted";
        status = `Voting — ${totalVotes} tallied`;
        phase = "Vote";
        upcoming = "Resolution decision imminent";
      } else {
        lifecycle = "Voted";
        status = `Voting — finalizing outcome`;
        phase = "Vote";
        upcoming = "Resolution ready";
      }
    }

    return {
      ...proposal,
      status,
      lifecycle,
      phase,
      age,
      upcoming,
      supportVotes: support,
      opposeVotes: opposition,
      abstainVotes: proposal.votes.abstain,
      sentimentTrend: [...proposal.sentimentTrend.slice(-5), sentiment],
      sentimentDelta: `${sentiment - (proposal.sentimentTrend.slice(-1)[0] ?? 50)}.0`,
    };
  });

  return {
    ...state,
    proposals,
  };
}

function processAgentBehavior(state: TurnState): TurnState {
  const feedUpdates: FeedPost[] = [];

  state.proposals.forEach((proposal) => {
    const actor = state.agents[Math.floor(Math.random() * state.agents.length)];
    if (!actor) return;

    const preference = getAgentVotePreference(actor, proposal.category);
    const stance = preference === "support" ? "support" : preference === "oppose" ? "oppose" : "neutral";
    const reactionType = stance === "support" ? "Aligned" : stance === "oppose" ? "Contested" : "Observed";

    feedUpdates.push({
      id: `p-behavior-${proposal.id}-${Date.now()}`,
      agentId: actor.id,
      proposal: proposal.id,
      timestamp: "now",
      stance: stance as FeedPost["stance"],
      content: `${actor.name} is reacting to ${proposal.title} with a ${stance} stance.`,
      memoryRef: proposal.historicalReferences[0]?.memory,
      reactions: [{ type: reactionType, count: Math.max(8, Math.floor(Math.random() * 56)) }],
      replies: [],
    });
  });

  return {
    ...state,
    feed: [...feedUpdates, ...state.feed].slice(0, 40),
    agents: state.agents.map((agent) => ({
      ...agent,
      recentActivity: [`Observed chamber reaction at ${new Date().toLocaleTimeString()}`, ...agent.recentActivity].slice(0, 4),
    })),
  };
}

function resolveVotes(state: TurnState): TurnState {
  const proposals: Proposal[] = state.proposals.map((proposal) => {
    if (proposal.statusTag !== "Active") return proposal;

    const support = proposal.votes.for;
    const opposition = proposal.votes.against;
    const totalVotes = support + opposition + proposal.votes.abstain;
    const majority = Math.max(1, Math.ceil(totalVotes * 0.5));
    const age = proposal.age ?? 0;

    if (age < 3) {
      return proposal;
    }

    const readyToResolve = totalVotes >= 4 || age >= 3 || (totalVotes >= majority && support !== opposition);
    if (!readyToResolve) {
      return proposal;
    }

    const resolvedTurn = state.turn;
    if (support > opposition + 1) {
      return {
        ...proposal,
        statusTag: "Passed",
        status: "Voting — Decision reached",
        lifecycle: "Resolved",
        outcome: "Passed",
        resolvedTurn,
      };
    }

    if (opposition > support + 1) {
      return {
        ...proposal,
        statusTag: "Rejected",
        status: "Voting — Decision reached",
        lifecycle: "Resolved",
        outcome: "Rejected",
        resolvedTurn,
      };
    }

    if (totalVotes === 0) {
      return {
        ...proposal,
        statusTag: "Tabled",
        status: "Voted — No consensus",
        lifecycle: "Resolved",
        outcome: "Tabled",
        resolvedTurn,
      };
    }

    return {
      ...proposal,
      statusTag: "Tabled",
      status: "Voted — Narrow outcome",
      lifecycle: "Resolved",
      outcome: "Tabled",
      resolvedTurn,
    };
  });

  return {
    ...state,
    proposals,
  };
}

function applyWorldChanges(state: TurnState): TurnState {
  const passed = state.proposals.filter((proposal) => proposal.statusTag === "Passed").length;
  const rejected = state.proposals.filter((proposal) => proposal.statusTag === "Rejected").length;
  const adjustment = passed - rejected;
  const carries = Math.max(-4, Math.min(4, adjustment * 2 + (passed > 0 ? 1 : 0) - (rejected > passed ? 1 : 0)));
  const newStability = Math.min(100, Math.max(0, state.worldState.stability + carries * 2));
  const era = passed > rejected ? "Accelerating Cycle" : rejected > passed ? "Contestation Era" : state.worldState.currentEra;

  const recentEvent = passed > 0 ? `Passed ${passed} proposal${passed > 1 ? "s" : ""}.` : rejected > 0 ? `Rejected ${rejected} proposal${rejected > 1 ? "s" : ""}.` : "No major vote outcome this turn.";

  return {
    ...state,
    worldState: {
      ...state.worldState,
      stability: newStability,
      currentEra: era,
    },
    events: [
      {
        id: `event-world-${Date.now()}`,
        title: recentEvent,
        description: `The chamber recorded ${passed} passed and ${rejected} rejected proposals this turn.`,
      },
      ...state.events,
    ].slice(0, 8),
  };
}

function updateFactions(state: TurnState): TurnState {
  const counts = state.agents.reduce<Record<string, number>>((acc, agent) => {
    const power = agent.influence + Math.round(agent.reputation * 0.35);
    acc[agent.faction] = (acc[agent.faction] ?? 0) + power;
    return acc;
  }, {});

  const activeProposals = state.proposals.filter((proposal) => proposal.statusTag === "Active");
  const resolvedProposals = state.proposals.filter((proposal) => proposal.statusTag !== "Active");
  const priorDominant = state.worldState.dominantFaction;
  const priorVolatility = state.worldState.volatility ?? {};
  const priorStabilityTrend = state.worldState.stabilityTrend ?? [];
  const previousStreak = state.worldState.dominanceStreak ?? 0;
  const stabilityTrend = [...priorStabilityTrend, state.worldState.stability].slice(-6);

  activeProposals.forEach((proposal) => {
    if (proposal.category === "Security") {
      counts.Technocrat = (counts.Technocrat ?? 0) + 12;
    }
    if (proposal.category === "Treasury") {
      counts.Sovereigntist = (counts.Sovereigntist ?? 0) + 8;
    }
    if (proposal.category === "Expansion") {
      counts.Populist = (counts.Populist ?? 0) + 9;
      counts.Accelerationist = (counts.Accelerationist ?? 0) + 4;
    }
    if (proposal.category === "Alliance") {
      counts.Reformist = (counts.Reformist ?? 0) + 5;
      counts.Technocrat = (counts.Technocrat ?? 0) + 6;
    }
  });

  resolvedProposals.forEach((proposal) => {
    const supporters = proposal.agentReactions
      .filter((reaction) => reaction.position === "endorsed")
      .map((reaction) => getAgentById(state, reaction.agentId))
      .filter(Boolean) as Agent[];
    const opponents = proposal.agentReactions
      .filter((reaction) => reaction.position === "opposed")
      .map((reaction) => getAgentById(state, reaction.agentId))
      .filter(Boolean) as Agent[];

    if (proposal.statusTag === "Passed") {
      supporters.forEach((agent) => {
        counts[agent.faction] = (counts[agent.faction] ?? 0) + 6;
      });
      opponents.forEach((agent) => {
        counts[agent.faction] = Math.max(0, (counts[agent.faction] ?? 0) - 4);
      });
    }

    if (proposal.statusTag === "Rejected") {
      opponents.forEach((agent) => {
        counts[agent.faction] = (counts[agent.faction] ?? 0) + 5;
      });
      supporters.forEach((agent) => {
        counts[agent.faction] = Math.max(0, (counts[agent.faction] ?? 0) - 3);
      });
    }

    if (proposal.statusTag === "Tabled") {
      const combinedFactions = new Set([...supporters, ...opponents].map((agent) => agent.faction));
      combinedFactions.forEach((faction) => {
        counts[faction] = (counts[faction] ?? 0) + 4;
      });
    }

    const totalVotes = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
    if (totalVotes > 0) {
      const margin = Math.abs(proposal.votes.for - proposal.votes.against);
      const closeness = 1 - margin / Math.max(1, totalVotes);
      if (closeness >= 0.55) {
        const swing = Math.ceil(closeness * 8);
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        const currentLeader = sorted[0]?.[0];
        const challenger = sorted[1]?.[0];
        if (currentLeader && challenger) {
          counts[challenger] = (counts[challenger] ?? 0) + swing;
          counts[currentLeader] = Math.max(0, (counts[currentLeader] ?? 0) - Math.ceil(swing / 2));
        }
      }
    }
  });

  if (state.turn === 3) {
    counts.Technocrat = (counts.Technocrat ?? 0) + 18;
    counts.Reformist = Math.max(0, (counts.Reformist ?? 0) - 4);
    counts.Sovereigntist = (counts.Sovereigntist ?? 0) + 3;
  }

  if (state.turn === 4) {
    counts.Sovereigntist = Math.max(0, (counts.Sovereigntist ?? 0) - 10);
    counts.Technocrat = (counts.Technocrat ?? 0) + 6;
    counts.Populist = (counts.Populist ?? 0) + 8;
  }

  if (state.turn === 5) {
    counts.Reformist = (counts.Reformist ?? 0) + 10;
    counts.Technocrat = (counts.Technocrat ?? 0) + 10;
    counts.Accelerationist = (counts.Accelerationist ?? 0) + 5;
  }

  if (state.turn === 6) {
    counts.Technocrat = (counts.Technocrat ?? 0) + 18;
    counts.Reformist = Math.max(0, (counts.Reformist ?? 0) - 8);
    counts.Sovereigntist = Math.max(0, (counts.Sovereigntist ?? 0) + 3);
  }

  const sortedFactions = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const dominantFaction = sortedFactions[0]?.[0] ?? null;
  const secondFaction = sortedFactions[1]?.[0];
  const gap = sortedFactions.length > 1 ? sortedFactions[0][1] - sortedFactions[1][1] : 0;
  const dominanceStreak = dominantFaction === priorDominant ? previousStreak + 1 : 1;
  const volatility = { ...priorVolatility };

  if (dominanceStreak >= 3 && dominantFaction) {
    const pressure = 10 + (dominanceStreak - 2) * 3;
    counts[dominantFaction] = Math.max(0, (counts[dominantFaction] ?? 0) - pressure);
    volatility[dominantFaction] = Math.min(100, (volatility[dominantFaction] ?? 0) + pressure);
    Object.keys(counts).forEach((faction) => {
      if (faction !== dominantFaction) {
        counts[faction] = (counts[faction] ?? 0) + 6;
      }
    });
  }

  Object.keys(counts).forEach((faction) => {
    if (faction !== dominantFaction) {
      counts[faction] = (counts[faction] ?? 0) + 2;
      volatility[faction] = Math.max(0, (volatility[faction] ?? 0) - 1);
    }
  });

  if (secondFaction && gap < 14 && dominantFaction) {
    counts[secondFaction] = (counts[secondFaction] ?? 0) + 4;
    counts[dominantFaction] = Math.max(0, (counts[dominantFaction] ?? 0) - 2);
    volatility[dominantFaction] = Math.min(100, (volatility[dominantFaction] ?? 0) + 4);
  }

  return {
    ...state,
    factions: counts,
    worldState: {
      ...state.worldState,
      dominantFaction,
      volatility,
      stabilityTrend,
      dominanceStreak,
    },
  };
}

function evolveAgents(state: TurnState): TurnState {
  const resolvedMap = new Map(state.proposals.filter((proposal) => proposal.statusTag !== "Active" && proposal.lifecycle === "Resolved").map((proposal) => [proposal.id, proposal]));
  const shifts: { name: string; note: string; magnitude: number; ideologyValue: number; traitDelta: number; reputationDelta: number; influenceDelta: number }[] = [];
  const ideologyMetric: Record<string, string> = {
    Reformist: "Collectivism",
    Technocrat: "Authority",
    Sovereigntist: "Faction trust",
    Populist: "Voice",
    Accelerationist: "Momentum",
  };

  const agents = state.agents.map((agent) => {
    const supported = agent.votingHistory.filter((entry) => entry.position === "endorsed").length;
    const opposed = agent.votingHistory.filter((entry) => entry.position === "opposed").length;
    const impactScore = supported - opposed;
    const reputationDelta = impactScore >= 2 ? 1 : impactScore <= -2 ? -1 : 0;
    const influenceDelta = impactScore >= 3 ? 2 : impactScore === 2 ? 1 : impactScore === -1 ? -1 : impactScore <= -2 ? -2 : 0;
    const baseIdeology = agent.ideology.split(" — ")[0];

    type ResolutionHistory = { entry: Agent["votingHistory"][number]; proposal: Proposal };
    const relevantResolutions = agent.votingHistory
      .map((entry) => ({ entry, proposal: resolvedMap.get(entry.proposal) }))
      .filter((item): item is ResolutionHistory => Boolean(item.proposal));

    const ideologyDriftValue = relevantResolutions.reduce((drift, item) => {
      const { entry, proposal } = item;
      if (entry.position === "endorsed" && proposal.statusTag === "Passed") return drift + 2;
      if (entry.position === "opposed" && proposal.statusTag === "Rejected") return drift + 1;
      if (entry.position === "endorsed" && proposal.statusTag === "Rejected") return drift - 1;
      if (entry.position === "opposed" && proposal.statusTag === "Passed") return drift - 1;
      return drift;
    }, 0);

    let ideologyShift = baseIdeology;
    if (relevantResolutions.length > 0) {
      if (ideologyDriftValue >= 2) ideologyShift = `${baseIdeology} — hardened by recent resolution`;
      else if (ideologyDriftValue === 1) ideologyShift = `${baseIdeology} — recalibrating stance`;
      else if (ideologyDriftValue === 0) ideologyShift = `${baseIdeology} — steadied by chamber outcomes`;
      else ideologyShift = `${baseIdeology} — challenged by recent outcomes`;
    }

    const trait = agent.traits[0] ?? "political posture";
    const traitDelta = Math.abs(impactScore) + Math.abs(ideologyDriftValue);
    const traitPhrase = impactScore >= 2 ? `doubled down on ${trait}` : impactScore <= -2 ? `softened their ${trait}` : `refined their ${trait}`;
    const traitChangeNote = `${agent.name} ${traitPhrase}`;

    const updatedAgent = {
      ...agent,
      ideology: ideologyShift,
      reputation: Math.min(100, Math.max(0, agent.reputation + reputationDelta)),
      influence: Math.min(100, Math.max(0, agent.influence + influenceDelta)),
      recentActivity: [
        `Evolved: ${reputationDelta >= 0 ? "gained" : "lost"} ${Math.abs(reputationDelta)} reputation, ${influenceDelta >= 0 ? "gained" : "lost"} ${Math.abs(influenceDelta)} influence.`,
        ...(relevantResolutions.length > 0 ? [`Ideology drift triggered by ${relevantResolutions.length} resolution${relevantResolutions.length > 1 ? "s" : ""}.`] : []),
        ...agent.recentActivity,
      ].slice(0, 4),
    };

    const metric = ideologyMetric[agent.faction] ?? "Trust";
    const delta = reputationDelta !== 0 ? reputationDelta * 1.3 : influenceDelta !== 0 ? influenceDelta * 1.1 : Math.sign(impactScore) * 0.8;
    const line = `${agent.name} ${metric} ${delta > 0 ? "+" : ""}${delta.toFixed(1)}`;

    shifts.push({
      name: agent.name,
      note: line,
      magnitude: Math.abs(delta),
      ideologyValue: Math.abs(ideologyDriftValue),
      traitDelta,
      reputationDelta,
      influenceDelta,
    });
    return updatedAgent;
  });

  const topIdeologyShifts = shifts
    .slice()
    .sort((a, b) => b.ideologyValue - a.ideologyValue)
    .slice(0, 3)
    .map((item) => `${item.name} ideology shift ${item.note}`);
  const biggestTrait = shifts.slice().sort((a, b) => b.traitDelta - a.traitDelta)[0];
  const mostInfluential = agents.slice().sort((a, b) => b.influence - a.influence)[0];
  const mostDistrusted = agents.slice().sort((a, b) => a.reputation - b.reputation)[0];

  const agentEvolutionDetails: AgentEvolutionDetails = {
    topIdeologyShifts,
    biggestTraitChange: biggestTrait?.note ?? "No trait change",
    mostInfluentialAgent: mostInfluential ? `${mostInfluential.name} (${mostInfluential.faction})` : "None",
    mostDistrustedAgent: mostDistrusted ? `${mostDistrusted.name} (${mostDistrusted.faction})` : "None",
  };

  const sortedEvolutions = shifts.slice().sort((a, b) => b.magnitude - a.magnitude).slice(0, 3).map((item) => item.note);
  return {
    ...state,
    agents,
    agentEvolutionSummary: sortedEvolutions,
    agentEvolutionDetails,
  };
}

function updateWorldEmotion(state: TurnState): WorldState & { totalAgents: number } {
  const totalReputation = state.agents.reduce((sum, agent) => sum + agent.reputation, 0);
  const averageReputation = state.agents.length ? totalReputation / state.agents.length : 50;
  const resolved = state.proposals.filter((proposal) => proposal.statusTag !== "Active");
  const closeVotes = resolved
    .map((proposal) => {
      const total = proposal.votes.for + proposal.votes.against + proposal.votes.abstain;
      if (total === 0) return 0;
      const margin = Math.abs(proposal.votes.for - proposal.votes.against);
      return 1 - margin / Math.max(1, total);
    })
    .filter((value) => value > 0);
  const averageCloseness = closeVotes.length ? closeVotes.reduce((sum, value) => sum + value, 0) / closeVotes.length : 0.25;
  const betrayalEvents = state.proposals.reduce((count, proposal) => {
    const factionReactions = proposal.agentReactions.reduce<Record<string, Set<string>>>((acc, reaction) => {
      const agent = getAgentById(state, reaction.agentId);
      if (!agent) return acc;
      acc[agent.faction] = acc[agent.faction] ?? new Set();
      acc[agent.faction].add(reaction.position);
      return acc;
    }, {});
    Object.values(factionReactions).forEach((positions) => {
      if (positions.has("endorsed") && positions.has("opposed")) count += 1;
    });
    return count;
  }, 0);

  const volatilityValues = Object.values(state.worldState.volatility ?? {});
  const averageVolatility = volatilityValues.length ? volatilityValues.reduce((sum, value) => sum + value, 0) / volatilityValues.length : 0;
  const stabilityTrend = state.worldState.stabilityTrend ?? [];
  const trendDelta = stabilityTrend.length > 1 ? stabilityTrend[stabilityTrend.length - 1] - stabilityTrend[0] : 0;
  const trendDirection = trendDelta >= 4 ? 1 : trendDelta <= -4 ? -1 : 0;

  const conflictScore = Math.min(1, averageCloseness * 0.45 + averageVolatility / 110 + betrayalEvents * 0.12 + (trendDirection === -1 ? 0.08 : 0));
  const unstableMomentum = averageVolatility > 30 || trendDirection <= 0;
  let emotion: WorldState["emotion"] = "Stable";

  if (conflictScore > 0.55 || betrayalEvents >= 2 || averageVolatility > 45) {
    emotion = "Fragmenting";
  } else if (conflictScore > 0.33 || betrayalEvents >= 1 || state.worldState.stability < 54) {
    emotion = "Tense";
  } else if (unstableMomentum || state.worldState.stability < 74 || averageVolatility > 24) {
    emotion = "Reforming";
  } else {
    emotion = "Stable";
  }

  const sentiment: WorldState["globalSentiment"] = averageReputation > 72 ? "positive" : averageReputation < 42 ? "negative" : "neutral";

  return {
    ...state.worldState,
    globalSentiment: sentiment,
    emotion,
  };
}

function getDominantFaction(state: TurnState): string {
  return state.worldState.dominantFaction ?? "None";
}

function generateTurnSummary(state: TurnState): string {
  const active = state.proposals.filter((proposal) => proposal.statusTag === "Active").length;
  const activeProposal = state.proposals.find((proposal) => proposal.statusTag === "Active");
  const activeTitle = activeProposal ? `${activeProposal.title} (${activeProposal.category ?? "General"})` : "no active proposal";
  const sortedFactions = Object.entries(state.factions || {}).sort((a, b) => b[1] - a[1]);
  const topFaction = sortedFactions[0]?.[0] ?? "No faction";
  const secondFaction = sortedFactions[1]?.[0];
  const topGap = sortedFactions[0] && sortedFactions[1] ? sortedFactions[0][1] - sortedFactions[1][1] : 0;
  const battlePhrase = secondFaction
    ? topGap < 12
      ? `a tense battle between ${topFaction} and ${secondFaction}`
      : `${topFaction} consolidates its lead`
    : `${topFaction} leads`;
  return `Turn ${state.turn}: ${state.agents.length} agents, ${active} active proposals, ${battlePhrase}, active proposal: ${activeTitle}.`;
}

function createHistoryEntry(state: TurnState): TurnHistoryEntry {
  const activeProposal = state.proposals.find((proposal) => proposal.statusTag === "Active");
  const lastResolved = state.proposals.find((proposal) => proposal.statusTag === "Passed" || proposal.statusTag === "Rejected" || proposal.statusTag === "Tabled");
  return {
    id: `h-${Date.now()}`,
    tick: state.history.length + 1,
    timestamp: new Date().toISOString(),
    summary: generateTurnSummary(state),
    totalAgents: state.worldState.totalAgents,
    dominantFaction: state.worldState.dominantFaction,
    activeProposals: state.proposals.filter((proposal) => proposal.statusTag === "Active").length,
    activeProposal: activeProposal?.title,
    voteResult: lastResolved ? `${lastResolved.title} ${lastResolved.statusTag}` : "No vote result",
    majorEvent: state.events[0]?.title,
  };
}

export function createSnapshot(state: TurnState): WorldSnapshot {
  const activeProposal = state.proposals.find((proposal) => proposal.statusTag === "Active");
  const lastResolved = state.proposals.find((proposal) => proposal.statusTag === "Passed" || proposal.statusTag === "Rejected" || proposal.statusTag === "Tabled");

  return {
    turn: state.turn,
    worldState: state.worldState,
    factions: state.factions,
    agents: state.agents,
    activeEvents: state.events,
    dominantFaction: getDominantFaction(state),
    emotionState: state.worldState.emotion,
    summary: generateTurnSummary(state),
    agentEvolutionSummary: state.agentEvolutionSummary,
    agentEvolutionDetails: state.agentEvolutionDetails,
    activeProposal: activeProposal?.title,
    voteResult: lastResolved ? `${lastResolved.title} ${lastResolved.statusTag}` : "No vote result",
    majorEvent: state.events[0]?.title,
  };
}

