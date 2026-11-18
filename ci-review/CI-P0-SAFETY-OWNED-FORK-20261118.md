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


## Exact-source independent native verification — 18 November 2026

A separate, **ephemeral Vercel Sandbox** successfully checked out the authentic owned full-history fork, exact commit `1daadcbf0d053660a512798f1cf8d57f54d94eb6` (not a reconstructed vendor snapshot), on Node.js `v22.23.5` and npm `10.9.9`. Project: `corporate-interface-native-qa` (project `prj_JgONukaRkJuGwMnAekEQNG5wld6Z`), session `sbx_p8IoaLMkr8RoJu904r9H6395sj6D`. This environment has **no production credentials or customer data** and is not Hostinger, GitHub Actions or any existing Render UAT deployment.

| Command | Actual observed result |
| --- | --- |
| `git rev-parse HEAD` | `1daadcbf0d053660a512798f1cf8d57f54d94eb6`, clean tracked worktree |
| `node --test ci-review/checkin-offline-p0.test.mjs ci-review/checkin-registration-p0.test.mjs` | **13/13 PASS**, 0 failed; original patch source-blob proofs passed |
| `npm ci --ignore-scripts --no-audit --no-fund --no-progress` | **PASS** |
| `npm run test:unit -- --run --maxWorkers 1` | **16/16 Vitest files pass; 102 passed / 1 skipped (103 total)** |
| `npm run i18n:check` | **PASS**; 12 fully translated locales (including Arabic), 359 matching keys per locale |
| `npm run build` | **PASS**; dist assets built, Vite nonfatal large-chunk/dynamic-import warnings |
| `npm run lint` | **PASS**, no warnings (max-warnings=0) |
| `npm run format:check` | **PASS** for the configured source-test glob |

Native commands ran via sandbox command IDs `cmd_d90ee72ba44c467aa197013bf862` (source checkout, 13 P0 tests, npm ci), `cmd_c14627c6a50748d1b9a929469d1e` (Vitest, i18n, build), `cmd_1f9b0f008b4a439fa8b8c0831d8c` (lint, format). No GitHub Actions were triggered; sandbox lifecycle is controlled separately. These results certify the **patched Check-in frontend native source/build regression at the exact SHA only**.

**Not certified:** authenticated Eventyay server/API/DB/worker installation; issuer-controlled payment/free/complimentary entitlement; real scanner provisioning or revoked credential lifecycle; original Eventyay server-side two-scanner end-to-end race; physical gates; customer transactions; deployment/rollback; full CI 20-module and 13-pack acceptance. Unsafe offline admission/payment actions remain **deliberately disabled**. Do not promote this source branch to paid/customer admission until these independent gates have evidence.

