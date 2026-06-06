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
    ...overrides,
  };
}
