import type { FeedPost } from "./polis-data";

export function attachCauseToEvent(event: FeedPost, causeEventId?: string) {
  if (!causeEventId) return event;
  return { ...event, causeEventId };
}

export function buildCausalChain(feed: FeedPost[], startEventId: string, depth = 10): FeedPost[] {
  const map = Object.fromEntries(feed.map((e) => [e.id, e]));
  const chain: FeedPost[] = [];
  let currentId: string | undefined = startEventId;
  let i = 0;
  while (currentId && i < depth) {
    const ev = map[currentId];
    if (!ev) break;
    chain.push(ev);
    currentId = ev.causeEventId ?? undefined;
    i += 1;
  }
  return chain;
}

export default { attachCauseToEvent, buildCausalChain };
