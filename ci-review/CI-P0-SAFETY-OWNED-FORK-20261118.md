# Corporate Interface — owned Eventyay Check-in P0 safety checkpoint

**Date:** 18 November 2026
**Scope:** Full-history owned fork `mnhatata-bot/eventyay-checkin`; isolated review branch `security/ci-p0-admission-failclosed-20261118`.
**Base:** Upstream-derived `development` commit `4e9756d27dd7fb99d3af0008e3a9641cc813f6d5`.
**Status:** Source safety containment and focused local test only. **NOT installed, NOT native certified, NOT accepted for gate entry.**

## Safely ported original source patches

Original base bytes in this fork were independently compared against the existing reviewed CI snapshot, and matched before each change. Modified fork files are byte-identical to their earlier reviewed P0 counterparts.

| File | Verified patched Git blob SHA |
| --- | --- |
| `src/offline/offlineActions.js` | `c6aab70b24ea550f6631216526793f799187094c` |
| `src/stores/liveRegistration.js` | `2a31340f8de056ec24d1326502cdd53a25f90044` |
| `src/stores/processEventyayCheckIn.js` | `0f4fca929a06823da4dc018c728a119018a1b002` |
| `src/offline/__tests__/offlineActions.spec.js` | `f269d64565fd1bd57a8a3844e5c0541385ec9da9` |
| `src/offline/__tests__/offlineResilience.spec.js` | `e337134855f441574fc21a6818ca956bd386843d` |
| `vitest.config.js` | `02d51a94b582a121d6ee742f671e1ae2723a1123` |

The two source-review Node tests are imported under `ci-review/` with paths adjusted to load the fork's real `src/` files. Their expected Git blob assertions still target the patched files.

## Actual local proof

- **Runner:** container, Node.js **22.16.0**.
- **Command:** `node --test ci-review/checkin-offline-p0.test.mjs ci-review/checkin-registration-p0.test.mjs`
- **Outcome:** **13/13 PASS, 0 failed**, 18 November 2026.
- **Reproducibility:** the two source files and the two adjusted tests were recreated locally with matching Git blob IDs before execution. This is local focused verification **not** a build on a hosted native provider, multi-device test or live deployment.
- Both safety modules disable unsafe admission/payment writes, preserve offline queue history without automatic replay, and allow read-only product browsing. Deny-all is intentional until server-authoritative issuance, entitlement and device authorization exist.

## Remaining hard gates

1. **Native frontend:** independently run `npm ci`, build, Vitest, i18n and visual QA on **this fork branch SHA**; the prior native check was on a separate CI review snapshot, not this fork.
2. **Native Eventyay server:** signed/device-bound scanner authentication, issuer-controlled paid/free/comp entitlement and server-side zone/list/scan reconciliation, with offline queue recovery.
3. **Multi-device:** two real clients contending for one ticket under network loss and resynchronization; no double entry.
4. **Commercial operations:** license/dependency/assets review, independently backed-up database, test restore/rollback, host permissions and two-tenant acceptance.
5. **Release:** deliberate source merge and an approved unified Corporate Interface full-product UAT, after the above evidence. The `development` branch and any prior accepted CI UAT must remain unchanged until approval.

**No Hostinger, GitHub Actions or deployment operations were requested or performed by this checkpoint.**
