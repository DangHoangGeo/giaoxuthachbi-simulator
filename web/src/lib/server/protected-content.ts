import "server-only";

/** Phase 05 must implement trusted-session and per-resource authorization before any read. */
export async function readProtectedResource(_untrustedRequest: unknown): Promise<never> {
  // Always deny, including caller-supplied roles. No storage connector or credentials exist.
  throw new Error("Protected access is not configured");
}
