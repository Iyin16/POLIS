// @0gfoundation/0g-storage-ts-sdk is unavailable in this environment.
// This stub keeps the rest of the app functional; archiving is a no-op.

export async function archiveGovernanceMemory(_memory: any) {
  console.warn("0G Storage: SDK unavailable, archiving skipped.");
  return { success: false, error: new Error("0G Storage SDK not available") };
}
