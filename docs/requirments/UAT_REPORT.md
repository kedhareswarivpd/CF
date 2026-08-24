# CoreFusion — Complete UAT & Workflow-to-Code Verification Report

**Date:** 2026-08-24
**Source of truth:** `docs/requirments/Complete_Website_Portal_Workflow.md`
**Method:** Live verification against the running Docker stack (Postgres, Redis, MinIO, backend on :8010, frontend on :8081) using real API calls, direct database inspection, and code-level RBAC/ownership audits — not just reading source and assuming correctness.

## Scope and honesty note

This is an exhaustive 48-phase specification covering the entire application. Within the time available, I prioritized in the order the spec itself flags as most critical: **P0 security/data-isolation**, **the core end-to-end business flow** (contact → lead → client → proposal → project handoff), and **RBAC boundary enforcement**. I verified these deeply, with live evidence. Several phases (documents module IDOR, meetings/notifications delivery, ticket SLA tracking, employee HR modules in depth, CMS-per-content-type publish verification, SEO field completeness, responsive/mobile UAT, cache/pagination-reset UAT) were **not independently re-verified in this session** — most of these were already covered by prior work earlier in this same engagement (see "Prior work this engagement" below), which I'm treating as standing evidence rather than re-testing from scratch. Where I did not personally verify something in this UAT pass, I say so explicitly rather than marking it PASS.

---

## Prior work this engagement (standing evidence, not re-verified today)

Before this UAT, the same session already:
1. Built the core production-hardening layer: cookie-based auth with CSRF, Zod validation, single-click mutation guards, server/client-side pagination — and **verified + fixed gaps in every portal** (Admin, SuperAdmin, Client, Partner, Sales, Marketing, HR, PM, Dev/QA/Support/Finance).
2. Ran a SonarQube-style static analysis remediation: fixed 3 failing backend tests, migrated Pydantic v2 config, added a sort-field allowlist, fixed a pagination-cap gap, added container resource limits, restricted MinIO console exposure, split a 553kB frontend chunk into per-role lazy chunks, built the missing MFA verification UI.
3. Built genuinely admin-editable backend models (`Leadership`, `Office`, `SiteContent`) for content that was previously hardcoded with no CMS path at all, and wired Privacy/Terms/Cookies/Services-FAQ to their existing (but previously unused) CMS resources.

All of that is committed and independently verified (lint/build/tests) earlier in this conversation. It is not re-litigated here.

---

## PHASE 0 — Repository Discovery (summary)

- **Backend:** `backend/` — FastAPI + SQLAlchemy async + asyncpg + Postgres, Alembic migrations, `require_roles`/`get_current_user` dependency-based RBAC, `AuditMiddleware` (automatic audit logging on every state-changing request), Redis-backed rate limiting, argon2id password hashing, httpOnly cookie sessions with CSRF double-submit.
- **Frontend:** `frontend/` — React + Vite, centralized `api/client.js` (cookie auth, CSRF, silent 401 refresh), Zod schemas in `schemas/`, `useAsyncAction` mutation guard, `Pagination`/`Skeleton`/`ErrorBoundary` primitives.
- **Models found** (69 total): every core entity the workflow doc names exists — `User`, `Role`, `Permission`, `Lead`, `Client`, `Employee`, `Project`, `Task`, `Proposal`, `Contract`, `Invoice`, `Payment`, `Ticket`, `Leave`, `Attendance`, `Timesheet`, `PerformanceReview`, `Training`, `Payslip`, `EmployeeDocument`, `ClientFile`, `ClientReport`, `Meeting`, `Notification`, `AuditLog`, `Blog`, `Service`, `Industry`, `Faq`, `CaseStudy`, `Seo`, `PageContent`, `Leadership`, `Office`, plus 30+ more.
- **Routers found** (61 total): near-1:1 coverage of the model list, RBAC-gated via `require_roles(...)` at router or route level.

**Verdict:** the domain model and API surface are mature and comprehensive. The gaps found below are in *workflow wiring* (whether the pieces actually connect end-to-end the way the business document describes), not missing entities.

---

## PHASE 3/45 — Domain Model & Data Consistency: Critical Finding

**Only 1 real client account existed in the database before this session; 0 invoices; sample "projects" in the DB are unlinked marketing-showcase records (`client_id IS NULL`).** This means the payment/invoice segment of the documented workflow (Phase 18) has **never been exercised with real data in this environment** — I cannot claim it works end-to-end from observed production-like data, only from code inspection (see Phase 18 below).

---

## PHASE 4/39 — Data Isolation & Security UAT (live-tested)

All tests below were executed live against the running backend, not inferred from code reading alone.

| Test | Result | Evidence |
|---|---|---|
| Client A creates+sends a proposal; Client B (different, real, logged-in account) attempts `POST /clients/me/proposals/{id}/accept` | **PASS** — `404 Proposal not found` (not 403 — correctly avoids confirming the resource exists under another tenant) | Live curl, both clients real sessions |
| Client B lists `GET /clients/me/proposals` after the above | **PASS** — returns `[]`, does not leak Client A's proposal | Live curl |
| Rightful Client A then accepts the same proposal | **PASS** — `200`, status → `accepted` | Live curl |
| Already-accepted proposal: reject attempt | **PASS** — `400 Only a sent proposal can be accepted or rejected` (state machine enforced server-side) | Live curl |
| Employee (developer role) queries `/employees/me/payslips?employee_id=<other employee's real UUID>` | **PASS** — query param is silently ignored; endpoint is hardcoded to `current_user`'s own employee record, cannot be overridden | Live curl + source read (`app/routers/employees.py:160-167`) |
| Employee (developer) queries `/employees/me/leaves?employee_id=<other>` | **PASS** — same hardcoded-to-self pattern | Live curl |
| Employee (developer) → `GET /employees` (admin-only list) | **PASS** — `403` | Live curl |
| Employee (developer) → `GET /leads` (sales/marketing/admin/PM-only) | **PASS** — `403` | Live curl |
| Client → `GET /finance/invoices` (admin/finance-only) | **PASS** — `403` | Live curl |
| Support role → `GET /employees` (HR data) | **PASS** — `403` | Live curl |
| Sales role → `POST /blogs` (CMS write, admin/marketing-only) | **PASS** — `403` | Live curl |
| Unauthenticated → `GET /dashboard/overview` | **PASS** — `401` | Live curl |
| Rapid double/triple-click on `POST /leads/{id}/convert` (3 back-to-back calls) | **PASS** — exactly 1 `Client` row created, all 3 calls return the same client id | Live curl + DB count query |

**P3 finding (not fixed, flagged):** `frontend`-facing `/clients/me/*` router (`app/routers/clients.py`) is gated only by `Depends(get_current_user)` at the router level — any authenticated user of ANY role, not just `client`, can hit these routes, and `_get_client_for_user` will silently auto-create a spurious `Client` profile row tied to their own account on first access. This does not leak any other user's data (the auto-created row is always tied to `current_user.id`), so it is not a data-isolation breach, but it is a data-hygiene gap: an admin or employee poking at `/clients/me/profile` would get a junk `Client` row created for themselves. Fixing this cleanly requires either a per-route role check or restructuring the router (it also serves legitimate staff sub-routes later in the same file), which I did not want to risk mid-audit without dedicated testing. **Recommended fix:** add `current_user.role == "client"` guard inside `_get_client_for_user` (raise 403 otherwise) rather than a router-level dependency, to avoid touching the staff-facing routes in the same file.

---

## PHASE 40 — Audit Logging (live-verified)

**PASS.** Confirmed via direct query against `audit_logs`: every state-changing request in this session's test flow was captured automatically (`POST_api_v1_auth_login`, `POST_api_v1_leads_{id}_convert`, `POST_api_v1_proposals`, `POST_api_v1_proposals_{id}_send`, `POST_api_v1_clients_me_proposals_{id}_accept`, etc.) with `action`, `entity_type`, `entity_id`, `created_at`. This is implemented generically via `AuditMiddleware` (not a per-endpoint opt-in), so it covers the full surface of state-changing routes without requiring per-feature audit-logging code.

---

## PHASE 3/10/11 — Lead → Client Conversion & Credential Email: CRITICAL FINDING, FIXED

### What was broken

1. **No explicit "Convert Lead to Client" action existed anywhere in the codebase.** `Lead` had a `converted_client_id`/`LeadStatus.converted` field, but the *only* code path that ever set it was buried inside `contracts.py`'s `sign_contract` handler — client accounts were provisioned **only as a side effect of a contract being fully signed**, which in this codebase's implementation happens *after* proposal negotiation, not right after "successful lead evaluation" as the workflow doc describes (§3).
2. **The entire `/proposals` router — including `accept_proposal`/`reject_proposal` — was gated `require_roles("sales","admin","project_manager","marketing")` at the router level.** A client could never call these endpoints themselves under any circumstance.
3. **`ClientPortal.jsx` had zero references to "proposal" anywhere in the file.** There was no Proposals tab, no accept/reject UI, nothing. Combined with (2), even if a client had portal access, there was no way — frontend or backend — for them to complete the documented "client accepts/rejects proposal" step.

This is not a minor gap: it is the **pivot point of the entire documented business workflow** ("Client Accepts Proposal? YES → Project Created"). Per the workflow doc, this step gates project creation.

### What was fixed (this session, committed)

- `POST /leads/{lead_id}/convert` (admin/project_manager only, matching the doc's "credentials can be generated by an authorized user such as Admin or Project Manager") — provisions the client account explicitly, right after lead qualification, independent of any proposal/contract.
- Extracted the existing (already-secure) provisioning logic into `app/services/client_provisioning.py`, shared by both the new explicit-conversion path and the existing contract-signing auto-provision path, so neither can double-provision an account for the same lead.
- `GET/POST /clients/me/proposals`, `/clients/me/proposals/{id}/accept`, `/clients/me/proposals/{id}/reject` — client-facing, ownership-scoped via `proposal.lead.converted_client_id == current client`, state-machine-guarded (`sent`-only), cross-tenant access returns 404.
- Added `client_comment`/`rejection_reason` columns to `Proposal` (required by the doc §7, previously absent from the model) via a new Alembic migration, applied and verified against the live database.
- Added a **Proposals tab to `ClientPortal.jsx`** — full accept/reject UI, following the same `Pagination`/`useAsyncAction`/`Skeleton` conventions established elsewhere this session.

### Credential email — security note (Phase 11)

The workflow doc's literal wording ("email should contain... Password") describes emailing a plaintext password. **The actual implementation does the secure thing instead**, and I did not weaken it to match the doc's literal wording (per the audit's own explicit instruction not to do this): a brand-new client account gets a hashed, unusable random placeholder password, and the "credential email" is actually a real, single-use, 1-hour-expiring password-*set* link (the same mechanism as `/auth/forgot-password`), plus a separate welcome email. Verified live: both emails logged as sent, a real `password_reset_tokens` row was created with a proper expiry, and the account cannot be logged into until the client sets their own password via that link. **This is correct, secure behavior — the doc's literal wording should not be treated as a requirement to email plaintext passwords.**

### Live E2E evidence (full trace)

```
POST /contact                          → 201, contact_submissions row created
POST /leads (as admin)                 → 201, Lead{status: new}
POST /leads/{id}/convert (as admin)    → 201, Client + User{role:client} created
                                          → password_reset_tokens row created
                                          → "Password Reset Request" + "Welcome to
                                            CoreFusion Technologies" emails sent
                                          → Lead{status: converted, converted_client_id: <new client>}
POST /leads/{id}/convert  (x3 more, rapid) → 200 each, same client returned, DB count = 1
POST /proposals (as admin, lead_id)    → 201, Proposal{status: draft, version: 1}
POST /proposals/{id}/send (as admin)   → 200, Proposal{status: sent}
GET /clients/me/proposals (as new client, real session) → 200, [proposal] visible
POST /clients/me/proposals/{id}/accept (as WRONG client) → 404
GET  /clients/me/proposals (as WRONG client)             → 200, []
POST /clients/me/proposals/{id}/accept (as RIGHT client) → 200, Proposal{status: accepted}
POST /clients/me/proposals/{id}/reject (as RIGHT client, now-accepted) → 400 (state machine)
```

Every step above is a real, live request against the running stack — not simulated.

**Known limitation:** I could not complete a live *browser* click-through of the new Proposals tab — the browser automation tool was unreliable for form submission in this environment (consistent with flakiness other parts of this session also hit). I verified the frontend code is correct (lint/build clean, follows established patterns exactly, calls the verified-working API endpoints with correct payload shapes) and the backend contract end-to-end via direct API calls, which is the authoritative verification per this audit's own standard, but a manual UI click-through is still recommended before shipping.

---

## PHASE 7 — Proposal State Machine

| Transition | Result |
|---|---|
| `draft` → `sent` (staff `send_proposal`) | PASS — verified live |
| `sent` → `accepted` (client) | PASS — verified live |
| `sent` → `rejected` (client, with reason) | PASS (code path verified; reason persisted to `rejection_reason`) |
| `accepted` → `rejected` (invalid transition) | **PASS — correctly rejected**, `400 Only a sent proposal can be accepted or rejected` |
| `draft` → `accepted` (skip send) | Not directly tested, but the same guard clause (`status != sent`) that blocked the invalid `accepted → rejected` transition also blocks this — same code path, high confidence PASS |

---

## PHASE 8/9 — Client → Project handoff

Proposal acceptance does **not** auto-create a `Project` row. It sends a notification to `admin`/`project_manager` roles ("ready to start the project"), and project creation remains a manual step via the existing, already-verified `ProjectsManagement`/`AddProjectForm` in AdminPanel (or `TeamProjects` in the PM's own portal view). **This is treated as intentional, not a gap** — automatically spawning a `Project` row with no real start/end dates or team assignment would produce worse data than a human-in-the-loop handoff, and nothing in the workflow doc explicitly demands full automation here (only that a project tracker exist "once the proposal is accepted," which the existing Project model and PM tooling already support).

---

## PHASE 5 — RBAC Matrix (partial, live-verified subset)

|                | Admin | Sales | PM | HR | Employee | Support | Finance | Client |
|---|---|---|---|---|---|---|---|---|
| `/leads` | ✅ | ✅ | ✅ | ❌(403, verified) | ❌(403, verified) | ❌ | ❌ | ❌ |
| `/proposals` (staff CRUD) | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ (only own via `/clients/me/proposals`, verified) |
| `/clients/me/proposals/accept` | — | — | — | — | — | — | — | ✅ (own only, verified) |
| `/employees` (list) | ✅ | — | — | ✅(assumed, not directly tested) | ❌(403, verified) | ❌(403, verified) | — | — |
| `/finance/*` | ✅ | — | — | — | — | — | ✅(assumed) | ❌(403, verified) |
| `/blogs` (CMS write) | ✅ | ❌(403, verified) | — | — | — | — | — | — |
| `/employees/me/payslips` | — | — | — | — | ✅ own-only (verified: cannot override via query param) | — | — | — |

Cells marked "assumed" reflect router-level `require_roles(...)` I read in source but did not independently exercise with a live login in this pass (time-constrained); everything marked "verified" was an actual live HTTP call this session.

---

## What was NOT covered in this UAT pass (honest gaps, not fabricated PASS)

Per the audit's explicit instruction not to fabricate results, the following phases from the 48-phase spec were **not independently re-verified live in this session** (though the underlying models/routers/frontend modules exist per the Phase 0 discovery, and much of the frontend-side production-hardening for these was verified earlier in this same engagement):

- Full project tracker workflow (daily updates → PM view → client-approved-only view distinction)
- Meeting scheduling → in-app + email notification delivery
- Document upload/download IDOR testing (client files, employee documents)
- Ticket SLA/priority resolution-deadline tracking (doc explicitly asks "verify whether this is actually implemented" — **not checked this pass**; flagging as genuinely unknown rather than guessing)
- Payment recording → invoice generation (the DB has zero invoices/payments; this segment has never been exercised with real data in this environment, so I cannot confirm it works beyond code-level plausibility)
- CMS publish → public-website-visibility for every content type individually (Services/Industries/Blog were spot-checked earlier this engagement; Case Studies, FAQs, Announcements were not)
- SEO field completeness per content type
- Full responsive/mobile UAT for the Proposals tab specifically (though the broader site got a systematic 320-1920px sweep earlier this engagement)
- Negative/error-code UAT beyond the RBAC 401/403/404 boundary tests above (429 rate-limiting, 500 handling, network-failure UX)
- Employee performance/training module ownership boundaries
- Leave/attendance/timesheet workflow live-tested end-to-end (leave-approval RBAC was fixed for pagination/validation earlier this engagement, but the actual approve→employee-notification flow wasn't live-tested this pass)

---

## Final Defect Classification

| ID | Finding | Priority | Status |
|---|---|---|---|
| D1 | No explicit Lead→Client conversion action; client account only provisioned via contract-signing side effect | **P0** — blocks the documented core business flow entirely | **FIXED** this session |
| D2 | `/proposals` accept/reject staff-only; client could never accept/reject a proposal | **P0** — blocks the documented core business flow entirely | **FIXED** this session |
| D3 | ClientPortal.jsx had no Proposals module | **P0** (paired with D2) | **FIXED** this session |
| D4 | `Proposal` model missing `client_comment`/`rejection_reason` fields the doc requires | **P2** | **FIXED** this session |
| D5 | `/clients/me/*` reachable by any authenticated role, auto-creates a junk `Client` row for non-client users | **P3** — data hygiene, not a data leak | **NOT FIXED** — flagged with a recommended fix above |
| D6 | Payment/invoice workflow has zero real data in this environment; not live-verified | **P1** (unknown risk — could be fully correct or have unverified gaps) | **NOT VERIFIED** this pass |
| D7 | Ticket SLA/resolution-deadline tracking — doc explicitly flags as needing verification | **P2** (unknown — doc itself expects this may be a gap) | **NOT VERIFIED** this pass |
| D8-D12 | Documents IDOR, meetings/notifications delivery, CMS-per-type publish, SEO completeness, project-tracker daily-update visibility rules | **P2** | **NOT VERIFIED** this pass |

---

## Test Evidence Summary

```
Backend:  ruff check app                → All checks passed
Backend:  pytest -q                     → 1171 passed, 0 failed
Frontend: npm run lint                  → 0 errors, 22 pre-existing warnings
Frontend: npm run build                 → succeeds
Migration: alembic upgrade head         → applied cleanly (a1b2c3d4e5f7)
Docker:   all 5 containers rebuilt, healthy
Live E2E: contact→lead→convert→proposal→send→accept trace (full transcript above)
Live security: 12 RBAC/isolation tests, all PASS (table above)
Live idempotency: 3x rapid lead-conversion clicks → 1 client (DB-verified)
Live audit trail: DB query confirms every above action logged automatically
```

---

## Final Verdict

# NOT PRODUCTION READY

**Justification:** The single most critical defect found this pass (D1/D2/D3 — the client could never accept a proposal, meaning the documented business workflow was structurally impossible to complete) has been found, fixed, and verified live end-to-end. That is a major result. But:

1. **The payment/invoice segment of the workflow has never been exercised with real data in this environment** (D6) — I can point to the code and RBAC gating, but I cannot say with the same confidence I have for the lead→proposal flow that it works correctly, because it has literally never run.
2. **Several P2 items the workflow doc itself flags as uncertain** (ticket SLA tracking) were not checked this pass.
3. **D5 (client-role gating on `/clients/me/*`)** is a real, if low-severity, gap.
4. **A live browser click-through of the newly-added Proposals UI was not completed** due to tooling flakiness in this environment — the code is verified correct by every other available means, but "verified correct by inspection and API testing" is not the same as "watched a real browser click Accept and confirmed the UI updated."

Given the scope of a 48-phase audit and the time available, this session made real, high-value progress on the most critical gap and produced honest, evidence-backed findings rather than a fabricated clean bill of health. **Recommended next steps before a production-readiness re-assessment:** (a) manually click through the new Proposals tab in a real browser, (b) run one real payment→invoice cycle end-to-end and verify the invoice appears correctly in the Client Portal, (c) determine whether ticket SLA tracking is implemented or needs building, (d) apply the D5 fix.
