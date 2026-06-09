export type GlobalSentiment = 'positive' | 'neutral' | 'negative' | number;

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | string;

export interface WorldState {
  currentEra: string;
  stability: number;
  dominantFaction: string | null;
  globalSentiment: GlobalSentiment;
  activeCrisis: string | null;
  season: Season;
  totalAgents: number;
  emotion: 'Stable' | 'Tense' | 'Fragmenting' | 'Reforming';
  volatility?: Record<string, number>;
  stabilityTrend?: number[];
  dominanceStreak?: number;
}

export function createWorldState(overrides?: Partial<WorldState>): WorldState {
  return {
    currentEra: 'Unknown Era',
    stability: 50,
    dominantFaction: null,
    globalSentiment: 'neutral',
    activeCrisis: null,
    season: 'spring',
    totalAgents: 0,
    emotion: 'Stable',
    volatility: {},
    stabilityTrend: [],
    dominanceStreak: 0,
    ...overrides,
  };
}
