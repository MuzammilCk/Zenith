# Project Context

*Read by `crud-checklist-for-ai-agent.md` and any other skill file that needs to know what this specific project is. This file is state, not method — it should change per project. The checklist should not change to match it.*

**Last confirmed:** 2026-07-19

---

## What this project is

- **One-line problem statement:** An enterprise-grade CRUD system for a karate institution. Admins have full authority (add students, instructors, control all data); instructors can add students and manage attendance for the classes they are assigned to. The critical gap being fixed: instructors must only see students in the classes the admin assigns them — currently any instructor can view ALL students, which is a major privacy/authorization flaw.
- **Tech stack:** TypeScript + React 19 (Vite 6) SPA frontend; Express 4 backend served from `server.ts` (run via `tsx`); file-based JSON "relational" database at `data/db.json` (`src/db/database.ts`); signed HMAC session tokens (no JWT lib) in `src/services/authService.ts`; Tailwind v4 styling; `node:test` suites run via `npm test`.

## Roles (actual, not generic)

- Role 1: admin — full authority: manage students, instructors, batches, promotions, audit logs; sees all data.
- Role 2: instructor — can add students and mark/manage attendance, but ONLY for the batches (classes) the admin assigns via `User.assignedBatchIds`. Cannot see students in other instructors' classes, cannot promote belts, cannot access user management or audit logs.
- Role 3: _(not used in this project)_
- Role 4: _(not used in this project)_

## Domain worksheet

1. **Highest-stakes mistake this app could make:** Misuse of student details and instructors having uncontrolled, full-system visibility. An instructor must never see students outside their assigned classes — that is the single biggest flaw and the priority fix.
2. **What has to keep working under bad conditions:** General robustness/availability ("everything, only if possible") — no specific offline/low-bandwidth/high-concurrency requirement was specified; treat as a normal small-dojo deployment.
3. **Who the user is accountable to, and for what:** Not specified by the user; left blank intentionally rather than guessed. (Admin is accountable to the dojo owner for data privacy and correct instructor-class assignment.)
4. **The one workflow that, if it breaks, makes the app pointless:** All workflows matter because this is a real production-grade system; no single workflow was singled out. (Primary user journeys: admin assigns instructor → class; instructor marks attendance for their class; admin tracks belts/promotions/audit.)
5. **What a domain expert would notice missing that a developer wouldn't:** Not specified by the user; left blank intentionally rather than guessed. (Likely candidate: correct instructor→class scoping, which is exactly the flaw being fixed.)

---

## Rules for whoever — human or agent — edits this file

- A blank field means "not yet answered." Leave it blank rather than filling it with a plausible guess. An empty field is a prompt for the agent to ask; a guessed field is a landmine three sections downstream.
- Never populate a field by inferring from existing code or a past conversation transcript — only from an answer the user actually gave. Extraction-by-inference reproduces whatever assumptions already exist, including wrong ones, and hands them back looking confirmed.
- Update **Last confirmed** every time an answer below changes.
- If the project's scope changes enough that an old answer might no longer hold, don't leave it as-is — re-confirm it explicitly and update the date.

## Change log

- _(date)_ — created
