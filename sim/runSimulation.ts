#!/usr/bin/env node
import { runTurn, type TurnState } from "../src/lib/turnEngine";
import { getPolisStoreSnapshot } from "../src/lib/polis-store";
import { proposals } from "../src/lib/polis-data";

function initialWorldState(): TurnState {
  const base = getPolisStoreSnapshot();
  return {
    ...base,
    turn: 0,
    factions: {
      Reformist: 1,
      Sovereigntist: 1,
      Technocrat: 1,
      Populist: 1,
      Accelerationist: 1,
    },
    events: [],
    proposals,
    history: [],
  };
}

async function runSimulation() {
  let state = initialWorldState();

  console.log("=== POLIS SIMULATION START ===");

  for (let turn = 1; turn <= 6; turn++) {
    console.log(`\n\n===== TURN ${turn} =====`);

    state = await runTurn(state, {
      type: "NONE",
    });

    console.log("\n--- WORLD STATE ---");
    console.log({
      turn: state.turn,
      emotion: (state.worldState as any)?.emotion,
      dominantFaction: state.worldState?.dominantFaction,
      stability: state.worldState?.stability,
    });

    console.log("\n--- LAST EVENT ---");
    console.log(state.history?.[state.history.length - 1]);
  }

  console.log("\n=== SIMULATION END ===");
}

runSimulation().catch((error) => {
  console.error(error);
  process.exit(1);
});
