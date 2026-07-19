# Project Context

*Read by `crud-checklist-for-ai-agent.md` and any other skill file that needs to know what this specific project is. This file is state, not method — it should change per project. The checklist should not change to match it.*

**Last confirmed:** _(set this whenever a field below is added or changed — if it's been a while, or scope has shifted, re-confirm before trusting it)_

---

## What this project is

- **One-line problem statement:**
- **Tech stack:**

## Roles (actual, not generic)

- Role 1:
- Role 2:
- Role 3:
- Role 4:

## Domain worksheet

1. **Highest-stakes mistake this app could make:**
2. **What has to keep working under bad conditions:**
3. **Who the user is accountable to, and for what:**
4. **The one workflow that, if it breaks, makes the app pointless:**
5. **What a domain expert would notice missing that a developer wouldn't:**

---

## Rules for whoever — human or agent — edits this file

- A blank field means "not yet answered." Leave it blank rather than filling it with a plausible guess. An empty field is a prompt for the agent to ask; a guessed field is a landmine three sections downstream.
- Never populate a field by inferring from existing code or a past conversation transcript — only from an answer the user actually gave. Extraction-by-inference reproduces whatever assumptions already exist, including wrong ones, and hands them back looking confirmed.
- Update **Last confirmed** every time an answer below changes.
- If the project's scope changes enough that an old answer might no longer hold, don't leave it as-is — re-confirm it explicitly and update the date.

## Change log

- _(date)_ — created
