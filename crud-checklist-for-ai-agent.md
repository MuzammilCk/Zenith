# CRUD App Specification & Self-Audit Protocol

*This document is meant to be read and followed by an AI coding agent building or auditing a CRUD application. Attach or paste it in full — the operating rules below are part of the specification, not optional framing.*

---

## Read this before doing anything else

1. **Two layers.** Layer 1 is the numbered checklist below — a structural quality bar, the same regardless of domain. Layer 2 is domain-specific and lives in the worksheet after Section 0. Completing Layer 1 does not mean the build is correct; both layers matter.

2. **Check for `project_context.md` first.** Before asking the user anything, look for a file named `project_context.md` in the project. If it exists, load it and treat its answers as authoritative for Section 0 and Section 0.5 — do not re-ask what it already answers. If a field is blank, marked TODO, or its "Last confirmed" date looks stale relative to what's being discussed now, ask the user about that specific field only, then write their answer back into the file. If `project_context.md` doesn't exist, ask the Section 0/0.5 questions directly, then offer to create it from the answers so future sessions don't have to ask again.

3. **Do not invent domain specifics.** Whether the answer comes from the user directly or from `project_context.md`, it must trace back to something the user actually confirmed — never a guess. A plausible-sounding guess is worse than no answer, because every downstream check inherits the error.

4. **Evidence, not vibes.** For every item you report as satisfied, point to the specific file, function, test, or observed behavior that proves it. If you can't, report it as not satisfied — code that resembles a solution is not the same as a working one.

5. **No silent skips.** If an item doesn't apply, say why. If something isn't implemented, say so plainly in your report.

6. **Audit yourself before declaring done.** Once the build is functionally complete, run this entire document against your own work and report results as a table: item — status (done / partial / not applicable) — evidence. A summary claim with no table behind it does not satisfy this document.

7. **Section 15 applies to you.** AI-generated code is exactly the kind of code most likely to look complete without being complete. Treat that section as a check on your own output, not a description of a hypothetical bad actor.

---

## Layer 1 vs. Layer 2

**Layer 1** is the numbered checklist below — domain-agnostic by design: roles enforced (not decorative), validation happening server-side, history tracked, tests real. Apply it the same way regardless of what this specific app does.

**Layer 2** is domain-specific and cannot be answered generically. It lives in the worksheet immediately below. Derive it for this project using what the user has told you, or by asking — never by guessing.

A build can satisfy every item in Layer 1 and still be the wrong system for the stated problem. Run both before reporting completion.

---

## 0) Confirm the roles

Do not default to generic "user and admin." Pull the roles from `project_context.md` if it exists and has them filled in. Otherwise, ask the user — then write the answer back into `project_context.md`.

Roles for this project:
- Role 1: _______________
- Role 2: _______________
- Role 3: _______________
- Role 4: _______________

Every "Per-role" line below means: check it once per role listed here, not once in general.

---

## 0.5) Domain worksheet — required before Section 1

Pull these answers from `project_context.md` if present. For anything blank or missing there, ask the user before proceeding — then write the answer back into `project_context.md` so it isn't asked again next session.

1. **Highest-stakes mistake this app could make?** Determines which sections below matter most.
2. **What has to keep working under bad conditions?** (offline/low-bandwidth, high concurrency, strict latency — whichever applies)
3. **Who is the user accountable to, and for what?** Shapes how strict Sections 13 and 16 need to be.
4. **Which single workflow, if it breaks, makes the app pointless?** This is the "primary user journey" in Section 1.
5. **What would a domain expert notice is missing that a developer wouldn't?** Ask the user rather than guessing.

Illustrative only — translate for the actual project domain, not these:

| Generic item | Disaster-response coordination | Banking / compliance |
|---|---|---|
| "History is preserved where needed" | Resource-allocation decisions must be reconstructable after the fact, often under post-incident review | Every compliance flag and escalation needs an immutable, timestamped trail for regulators |
| "Roles behave differently" | Field roles need offline-capable input under time pressure; oversight roles need real-time aggregate views across many field roles | Frontline roles see one case at a time; oversight roles need cross-case pattern detection |
| "Tells a story of how work gets done" | Request → triage → resource match → dispatch → confirmation, often with incomplete information | Case → analysis → flag → escalation → resolution — if any "real-time" step is actually batch-processed and presented as live, that's a Section 15 violation |

---

## 1) Product value

* [ ] Solves a real, specific problem for a real user group
* [ ] Has a clear domain, not a generic demo app
* [ ] Supports an actual workflow start to finish
* [ ] Goes beyond "create, read, update, delete"
* [ ] Includes business rules that matter in this domain
* [ ] Feels useful even without explanation
* [ ] Has one primary user journey and a few supporting ones
* [ ] **Per-role:** each role has a distinct reason to use the app — if two roles see the same screen with the same actions, one is decorative

---

## 2) Core CRUD quality

* [ ] Create flow works cleanly
* [ ] Read/list views are easy to scan
* [ ] Update flow is safe and obvious
* [ ] Delete flow has confirmation or soft-delete
* [ ] No duplicate or inconsistent records
* [ ] Validation blocks bad input before saving
* [ ] Empty states are handled
* [ ] Error states are meaningful, not generic
* [ ] **Per-role:** create/update/delete permissions differ by role

---

## 3) Data model quality

* [ ] Tables/collections are normalized or intentionally designed
* [ ] Relationships are correct, not hacked together
* [ ] History is preserved where needed
* [ ] Current state and historical state are separated properly
* [ ] IDs and foreign keys used consistently
* [ ] No unnecessary duplication of critical data
* [ ] Schema supports future expansion
* [ ] Sensitive data is not stored carelessly
* [ ] **Per-role:** the schema actually encodes role — a `role` column nothing ever reads is not enforcement

---

## 4) Workflow depth

* [ ] Actions follow a believable real-world process
* [ ] Multiple roles behave differently
* [ ] Records have a meaningful lifecycle
* [ ] Status changes are tracked over time
* [ ] Approvals, assignments, or reviews exist where relevant
* [ ] Records move through states, not just static forms
* [ ] Reports are built from workflow data, not hardcoded values
* [ ] **Per-role:** produce a sequence diagram showing which role does what at each stage — if you can't produce one, the workflow likely doesn't exist beyond the code

---

## 5) Auth and access control

* [ ] Login required for protected features
* [ ] Public signup disabled if the system should be controlled
* [ ] Roles exist and are enforced
* [ ] Admin and non-admin access differ
* [ ] Backend validates permissions, not just frontend
* [ ] Unauthorized actions return proper errors
* [ ] Sensitive routes are protected
* [ ] Role spoofing is impossible through the UI alone
* [ ] **Per-role:** test logging in as each role and confirm what it can/cannot do — don't assume from the code

---

## 6) Admin system quality

* [ ] Admin can manage users or staff
* [ ] Admin can assign permissions or roles
* [ ] Admin can see system-wide data
* [ ] Admin can disable or remove access safely
* [ ] Admin has audit visibility
* [ ] Admin tools are organized, not cluttered
* [ ] **Per-role:** admin overrides on behalf of other roles are logged, not silent

---

## 7) UI/UX quality

* [ ] Layout has clear hierarchy
* [ ] Typography is consistent and readable
* [ ] Spacing feels intentional
* [ ] Buttons have consistent style and states
* [ ] Inputs look modern and aligned
* [ ] Cards, tables, modals, badges are visually consistent
* [ ] Colors feel restrained and professional
* [ ] Mobile experience is not broken
* [ ] Desktop experience feels polished
* [ ] Loading, empty, and success states are handled well
* [ ] **Per-role:** each role's dashboard is visually distinct enough that a screenshot alone identifies the role

---

## 8) Component architecture

* [ ] UI built from reusable components
* [ ] No repeated one-off UI patterns
* [ ] Form fields, tables, modals, buttons, badges are standardized and reusable
* [ ] Page layouts follow a common system
* [ ] Components are small and composable

---

## 9) State management

* [ ] Local state used only where it makes sense
* [ ] Server state handled cleanly
* [ ] Loading and form submission states handled well
* [ ] Optimistic updates do not break data integrity
* [ ] Cache invalidation/refresh logic is correct
* [ ] Race conditions minimized
* [ ] UI reliably reflects backend truth

---

## 10) Validation and data integrity

* [ ] Required fields enforced
* [ ] Field formats validated
* [ ] Duplicate prevention exists where needed
* [ ] Range and date logic validated
* [ ] Cross-field validation exists when needed
* [ ] Invalid transitions are blocked
* [ ] Server-side validation exists, not just client-side
* [ ] **Prove it:** submit invalid data directly to the API (bypassing the UI) and confirm the server rejects it

---

## 11) Search, filter, sort, pagination

* [ ] Users can search records
* [ ] Filters are useful, not decorative
* [ ] Sort order can change
* [ ] Pagination or infinite scroll exists for large data
* [ ] Filter combinations work correctly
* [ ] No massive unbounded lists
* [ ] **Per-role:** search/filter results are scoped to what each role is allowed to see

---

## 12) Reporting and dashboards

* [ ] Dashboard shows meaningful summaries
* [ ] Numbers are derived from real data
* [ ] Reports answer actual business questions
* [ ] Reports are role-aware
* [ ] **Prove it:** every dashboard number traces to a real query — adding a record right now would visibly change at least one number

---

## 13) Auditability and history

* [ ] Important changes are tracked with user and timestamp
* [ ] Before/after values preserved where needed
* [ ] Logs are readable and useful
* [ ] Deletion is recoverable if necessary
* [ ] Status changes preserve history, not overwritten blindly
* [ ] **Per-role:** the audit log itself is role-gated

---

## 14) Error handling

* [ ] API errors mapped to useful UI messages
* [ ] Form errors shown near the right inputs
* [ ] 401, 403, 404, 500 handled properly
* [ ] Network failures have fallback behavior
* [ ] Failures do not corrupt state
* [ ] **Per-role:** a 403 is actually reachable and tested — log in as a low-privilege role and hit a high-privilege endpoint directly

---

## 15) Anti-simulation check — is it real or does it just look real?

This section applies to your own output specifically. AI-assisted scaffolding makes it easy to produce a validation layer, dashboard, or "engine" that looks complete without being complete.

* [ ] Every "processing" or "engine" claim in the README is backed by code you can point to and explain — not a black box
* [ ] Anything that claims to compute, validate, transform, or analyze has been tested with an input designed to break it, not just the happy path
* [ ] Permission checks exist on the server, confirmed by bypassing the frontend entirely
* [ ] Any "AI-powered" or "smart" feature is labeled honestly — if it's an LLM call dressed as a deterministic engine, say so
* [ ] Dashboard numbers are not leftover hardcoded placeholders
* [ ] Nothing silently fails while showing fake success (a "saved" toast firing on a failed save)
* [ ] You can trace what happens when any given action fires through every layer (UI → API → validation → DB → response) with no gap
* [ ] Any third-party integration is genuinely wired up or clearly marked mocked/stubbed — not silently faked and presented as live

---

## 16) Security baseline

* [ ] Passwords are hashed
* [ ] Secrets are not exposed in frontend code
* [ ] Environment variables used correctly
* [ ] Input is sanitized or validated
* [ ] Authorization checked on the server
* [ ] Sensitive endpoints protected
* [ ] CSRF/XSS risks considered where relevant
* [ ] File uploads controlled if present

---

## 17) Testing maturity

* [ ] Unit tests cover business logic
* [ ] Integration tests cover end-to-end flows
* [ ] Negative tests exist for invalid input
* [ ] Permission tests exist for each role
* [ ] Critical workflows are tested
* [ ] Tests are stable, not flaky
* [ ] **Per-role:** at least one test per role asserts what that role is forbidden from doing, not only what it can do

---

## 18) Code quality

* [ ] Files organized logically, naming clear and consistent
* [ ] Business logic separated from UI
* [ ] Data access separated from UI
* [ ] Components and functions are not oversized
* [ ] Repetition reduced, dead code removed

---

## 19) Scalability and maintainability

* [ ] New modules can be added without rewriting everything
* [ ] Roles can be expanded later without touching every file
* [ ] Status types or workflows can be extended later
* [ ] The app is not hardwired to one tiny use case

---

## 20) Deployment readiness

* [ ] App builds and deploys reliably
* [ ] Environment configuration is clean
* [ ] Database migrations are manageable
* [ ] Production and development setups are separated
* [ ] Logging exists

---

## 21) Documentation

* [ ] README explains the problem and features clearly
* [ ] Setup instructions work on a clean machine, not just the dev machine
* [ ] Architecture and tech stack are explained
* [ ] Screenshots exist for each role's view, not just one
* [ ] Any simulated/mocked component is explicitly disclosed (see Section 15)

---

## 22) Build-defense signals (produce these, don't just claim them)

* [ ] Write a one-sentence explanation of the business problem
* [ ] Write why this architecture was chosen over alternatives
* [ ] Identify what is genuinely non-trivial about the implementation
* [ ] Write how permissions work, per role
* [ ] Write the database design and its tradeoffs
* [ ] Write what the test suite actually protects against
* [ ] List tradeoffs made and what you'd improve next
* [ ] **Answer these directly, in writing, in your final report:**
  - [ ] What stops a normal user from editing the database directly through the API?
  - [ ] What happens if the lowest-privilege role tries to access the highest-privilege action?
  - [ ] Which parts of this were you uncertain about or unable to fully verify?
  - [ ] What's the one part least likely to survive adversarial testing?
  - [ ] If 10,000 more records were added right now, what's the first thing that would break?

---

## 23) Red flags

* [ ] Only forms with no workflow
* [ ] Only frontend with fake data
* [ ] No auth or trivial auth
* [ ] No role separation
* [ ] No history tracking, no tests, no validation
* [ ] All roles technically exist in the DB but behave identically in the app
* [ ] An impressive-sounding feature that's actually a single unvalidated LLM call
* [ ] Dashboard numbers that never change no matter what happens in the app
* [ ] The domain worksheet (Section 0.5) was skipped or answered with guesses instead of confirmed information

---

## Final verdict scale

### Basic CRUD
Simple forms, little business logic, no meaningful security, no tests. **Depth test:** no business rule is enforced server-side.

### Good project
Real data model, some auth, some validation, some tests. **Depth test:** auth exists but hasn't been tested per-role.

### Resume-worthy product
Role-based access, real workflow, history tracking, full validation, strong testing. **Depth test:** at least one test proves a role *can't* do something.

### Enterprise-grade CRUD
Secure auth, clean architecture, auditability, scalable data model, robust tests. **Depth test:** every item in Section 15 passes with evidence, not description.

**Report which tier this build has reached, and why**, backed by the evidence table from operating rule 5 — not a bare claim.

---

## Fast self-check

* [ ] RBAC — tested per-role, not just coded per-role
* [ ] History tracking
* [ ] Validation — server-side, confirmed via direct API test
* [ ] Search/filter/pagination scoped correctly per role
* [ ] Dashboard numbers provably derived from real data
* [ ] Reusable UI, unit tests, integration tests, deployment-ready architecture
* [ ] The 5 build-defense questions in Section 22 are answered in writing
* [ ] The domain worksheet (Section 0.5) is answered with confirmed information, not guesses

If any box above is unchecked, say so explicitly in the final report rather than omitting it.
