import type { Agent } from "./polis-data";

function sanitize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function shortHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36).padStart(6, "0").slice(-6);
}

export function getAgentId(agent: Pick<Agent, "slug" | "name" | "id">) {
  const nameSlug = sanitize(agent.slug || agent.name);
  const fingerprint = `${agent.id ?? ""}:${agent.name}:${agent.slug}`;
  return `polis-agent-${nameSlug}-${shortHash(fingerprint)}`;
}
