import { expect, it, vi } from "vitest";

// Test-runner-only marker stub; Next still enforces server-only in the production graph.
vi.mock("server-only", () => ({}));

import { readProtectedResource } from "../../src/lib/server/protected-content";

it.each([null, {}, { role: "site_manager" }, { role: "admin", path: "../../docs/private.pdf" }])(
  "denies every caller until real authorization exists",
  async (request) => {
    await expect(readProtectedResource(request)).rejects.toThrow(
      "Protected access is not configured",
    );
  },
);
