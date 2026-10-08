# Public-reader and build-boundary evidence

Second logical Web01 package, based on `e6c32f8`. The [implemented boundary](../../../docs/web/data-boundary.md) distinguishes current public validation from future authentication, publication-history and engineering schema work. No real content is released.

Checks: lint/typecheck, **31 unit cases**, production build, output/trace boundary scan, and **3 headed desktop Chrome journeys** all pass. Logs are adjacent in the parent directory with `-contracts` names. The build scan inspected 1,807 entries, 53,598,653 bytes and 2,799 trace references, finding no tested canaries/source paths or references outside `web/`. Counts describe this build, not a payload delivered to a visitor.

The primary review found that a checksum refinement could throw on an extremely short invalid asset path; a safe regex capture replaces that assumption, and six malformed-path cases now verify ordinary rejection. Other rejection cases include nested unknown fields, fixture production use, impossible dates, bad/mixed releases, hash mismatch, pending media rights, broken references, reused retired IDs and fabricated caller roles. A separate link/consistency check identified overly broad wording about reference resolution; the document now limits that claim to event media IDs and names the remaining editorial checks. No threshold or validation assertion was weakened.

The application still presents the same unpublished desktop shell. Browser checks verify the integrated reader, language/keyboard/no-JS reading and private-route denial; the earlier five visually inspected images remain evidence for the unchanged presentation at `e6c32f8`, not screenshots of this new build. No phone test is required. No GPU/model/audio behavior changed.

The manifest records source/evidence hashes and all 59 unchanged baseline engineering hashes. Log normalization removes terminal trailing whitespace/blank EOF lines only, retaining original SHA-256 values. The earlier shell package is immutable evidence tied to `e6c32f8`; run its source verifier at that revision, not against later source changes.

G1 clean-copy/CI/delivery work remains open. Cloud/real site inputs, public rights, owner review and all engineering holds remain unresolved. Actual authentication/asset authorization, private cache behavior and detailed engineering data consumers are not claimed by these checks.
