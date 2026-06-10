---
name: 0g-storage blocked
description: @0gfoundation/0g-storage-ts-sdk is permanently blocked by Replit's security firewall.
---

The package `@0gfoundation/0g-storage-ts-sdk` cannot be installed in Replit. All versions are blocked because the package depends on `es5-ext`, which is flagged as protestware across all versions by Replit's security policy.

**Why:** Replit's package firewall blocks es5-ext at the network level (HTTP 403 from package-firewall.replit.local). This is not a version-specific issue — all versions of es5-ext are blocked.

**How to apply:** Keep `src/lib/0g-storage.ts` as a graceful no-op stub that returns `{ success: false }` for all operations. Do not attempt to reinstall the package.
