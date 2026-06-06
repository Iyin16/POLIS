import type { WorldState } from "./world-state";
import type { PolisState } from "./polis-store";
import type { Agent, FeedPost, Memory, Proposal } from "./polis-data";

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
};

export type TurnState = PolisState & {
  turn: number;
  factions: any;
  events: any;
  proposals: Proposal[];
  history: TurnHistoryEntry[];
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

export async function runTurn(state: TurnState, playerAction?: PlayerAction) {
  let newState = cloneState(state);
  newState.turn = (state.turn ?? 0) + 1;

  if (playerAction) {
    newState = applyPlayerAction(newState, playerAction);
  }

  newState = processProposals(newState);
  newState = processAgentBehavior(newState);
  newState = resolveVotes(newState);
  newState = applyWorldChanges(newState);
  newState = updateFactions(newState);
  newState = evolveAgents(newState);
  newState.worldState = updateWorldEmotion(newState);
  newState.history = [...newState.history, createHistoryEntry(newState)];

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
      const faction = author?.faction ?? "Independent";
      const newProposal: Proposal = {
        id,
        slug: id.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: String(data.title ?? "Untitled Proposal"),
        status: "Drafting — Floor in 1d 00h",
        phase: "Pre-floor Review",
        statusTag: "Active",
        summary: String(data.summary ?? "No summary provided."),
        description: String(data.description ?? data.summary ?? "No description."),
        votes: { for: 0, against: 0, abstain: 0 },
        sentimentTrend: [50],
        treasuryImpact: String(data.treasuryImpact ?? "Moderate"),
        treasuryExposure: String(data.treasuryExposure ?? "Undetermined"),
        risk: Number(data.risk ?? 52),
        riskLevel: (data.riskLevel as Proposal["riskLevel"]) ?? "Moderate",
        sentimentDelta: "+0.0",
        agentReactions: author
          ? [{ agentId: author.id, position: "endorsed", statement: `Introduced by ${author.name} as a ${faction}-aligned motion.` }]
          : [],
        historicalReferences: data.category ? [{ memory: String(data.category), note: "Cited as precedent." }] : [],
        upcoming: String(data.upcoming ?? "Floor debate scheduled next turn"),
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
            content: `${author?.name ?? "A sovereign actor"} introduced ${newProposal.id}. ${newProposal.summary}`,
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
    const sentiment = totalVotes > 0 ? Math.round((support / totalVotes) * 100) : 50;
    const statusTag: Proposal["statusTag"] = support > opposition ? "Passed" : support < opposition ? "Rejected" : "Tabled";
    const phase = totalVotes > 0 ? "Voting" : proposal.phase;

    return {
      ...proposal,
      status: `${phase} — ${totalVotes} votes tallied`,
      statusTag,
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

    const stance = proposal.agentReactions.length % 3 === 0 ? "neutral" : proposal.agentReactions.length % 2 === 0 ? "support" : "oppose";
    feedUpdates.push({
      id: `p-behavior-${proposal.id}-${Date.now()}`,
      agentId: actor.id,
      proposal: proposal.id,
      timestamp: "now",
      stance: stance as FeedPost["stance"],
      content: `${actor.name} is reacting to ${proposal.id} with a ${stance} stance.`,
      memoryRef: proposal.historicalReferences[0]?.memory,
      reactions: [{ type: stance === "support" ? "Aligned" : "Contested", count: Math.max(12, Math.floor(Math.random() * 64)) }],
      replies: [],
    });
  });

  return {
    ...state,
    feed: [...feedUpdates, ...state.feed].slice(0, 40),
    agents: state.agents.map((agent) => ({
      ...agent,
      recentActivity: [`Observed chamber reaction at ${new Date().toLocaleTimeString()}` , ...agent.recentActivity].slice(0, 4),
    })),
  };
}

function resolveVotes(state: TurnState): TurnState {
  const proposals: Proposal[] = state.proposals.map((proposal) => {
    const support = proposal.votes.for;
    const opposition = proposal.votes.against;
    const threshold = Math.max(1, Math.ceil((support + opposition + proposal.votes.abstain) * 0.45));
    if (support >= threshold && support > opposition) {
      return { ...proposal, statusTag: "Passed", status: "Voting — Decision reached" };
    }
    if (opposition > support) {
      return { ...proposal, statusTag: "Rejected", status: "Voting — Decision reached" };
    }
    return proposal;
  });

  return {
    ...state,
    proposals,
  };
}

function applyWorldChanges(state: TurnState): TurnState {
  const activeProposals = state.proposals.filter((proposal) => proposal.statusTag === "Passed").length;
  const stabilityAdjustment = Math.max(-4, Math.min(4, activeProposals - 1));
  const newStability = Math.min(100, Math.max(0, state.worldState.stability + stabilityAdjustment));

  return {
    ...state,
    worldState: {
      ...state.worldState,
      stability: newStability,
      currentEra: activeProposals > 2 ? "Accelerating Cycle" : state.worldState.currentEra,
    },
  };
}

function updateFactions(state: TurnState): TurnState {
  const counts = state.agents.reduce<Record<string, number>>((acc, agent) => {
    acc[agent.faction] = (acc[agent.faction] ?? 0) + 1;
    return acc;
  }, {});
  const dominantFaction = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    ...state,
    worldState: {
      ...state.worldState,
      dominantFaction,
    },
  };
}

function evolveAgents(state: TurnState): TurnState {
  return {
    ...state,
    agents: state.agents.map((agent) => {
      const reputationDelta = agent.recentActivity.length > 1 ? 1 : -1;
      const influenceDelta = agent.votingHistory.length > 0 ? 1 : 0;
      return {
        ...agent,
        reputation: Math.min(100, Math.max(0, agent.reputation + reputationDelta)),
        influence: Math.min(100, Math.max(0, agent.influence + influenceDelta)),
      };
    }),
  };
}

function updateWorldEmotion(state: TurnState): WorldState & { totalAgents: number } {
  const totalReputation = state.agents.reduce((sum, agent) => sum + agent.reputation, 0);
  const averageReputation = state.agents.length ? totalReputation / state.agents.length : 50;
  const sentiment: WorldState["globalSentiment"] = averageReputation > 72 ? "positive" : averageReputation < 42 ? "negative" : "neutral";

  return {
    ...state.worldState,
    globalSentiment: sentiment,
  };
}

function getDominantFaction(state: TurnState): string {
  return state.worldState.dominantFaction ?? "None";
}

function generateTurnSummary(state: TurnState): string {
  const active = state.proposals.filter((proposal) => proposal.statusTag === "Active").length;
  return `Turn ${state.turn}: ${state.agents.length} agents, ${active} active events, dominant faction ${getDominantFaction(state)}.`;
}

function createHistoryEntry(state: TurnState): TurnHistoryEntry {
  return {
    id: `h-${Date.now()}`,
    tick: state.history.length + 1,
    timestamp: new Date().toISOString(),
    summary: generateTurnSummary(state),
    totalAgents: state.worldState.totalAgents,
    dominantFaction: state.worldState.dominantFaction,
    activeProposals: state.proposals.filter((proposal) => proposal.statusTag === "Active").length,
  };
}

export function createSnapshot(state: TurnState): WorldSnapshot {
  return {
    turn: state.turn,
    worldState: state.worldState,
    factions: state.factions,
    agents: state.agents,
    activeEvents: state.events,
    dominantFaction: getDominantFaction(state),
    emotionState: (state.worldState as any).emotion ?? "Stable",
    summary: generateTurnSummary(state),
  };
}
