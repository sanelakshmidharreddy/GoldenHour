# GoldenHour

GoldenHour is a guided, structured-response web application that helps a
victim or witness of an in-progress cyber fraud in India capture the right
information in the first minutes of an incident and convert that information
into verified, ready-to-use artefacts (helpline-ready summaries, FIR-ready
drafts, and NCRP/1930-ready payload references) backed by a verified,
non-AI knowledge base.

This repository contains the application source. The product specification,
architecture audit, verified knowledge base, and engineering reconnaissance
are the project source of truth and live under `docs/`.

---

## Technology stack

This ticket establishes only the repository foundation. The runtime stack is:

- **Frontend** — TypeScript (web). A framework selection (e.g. React/Vite) will
  be introduced by a later ticket. For now, `frontend/src/` is laid out with
  `components/`, `context/`, and `api/` to receive that work.
- **Backend** — TypeScript on Node.js. `backend/src/` is laid out with
  `routes/`, `ai/`, `session/`, `security/`, and `middleware/`.
- **Knowledge Base** — Static, verified JSON under `knowledge-base/`. This is
  the canonical source of facts (helplines, fraud playbooks, NCRP mapping,
  contacts, expectations, sources) and is the only authoritative reference
  the application consults.
- **Tests** — `tests/scenarios/` holds reproducible fraud-scenario fixtures
  used by future acceptance tests.

No AI provider, no real API keys, and no application endpoints exist yet.
Ticket 01 only scaffolds the repository.

---

## High-level repository structure

```
GoldenHour/
  backend/
    src/
      routes/        # HTTP route handlers (added in a later ticket)
      ai/            # Knowledge-base-driven responder (added in a later ticket)
      session/       # Session state (added in a later ticket)
      security/      # Security primitives (added in a later ticket)
      middleware/    # Express-style middleware (added in a later ticket)
  frontend/
    src/
      components/    # UI components (added in a later ticket)
      context/       # Client-side state context (added in a later ticket)
      api/           # Backend client (added in a later ticket)
  knowledge-base/
    fraud_playbooks/ # Verified fraud-specific playbooks
    contacts.json    # Verified helpline / authority contacts
    expectations.json# What each authority expects in a report
    ncrp_mapping.json# Mapping from incident signals to NCRP categories
    sources.json     # Provenance for every KB fact
    kb_meta.json     # Knowledge-base metadata
  docs/              # Project source of truth (see below)
  tests/
    scenarios/       # Reproducible fraud scenarios for acceptance tests
  .env.example       # Placeholder environment variables (no real secrets)
  .gitignore
  README.md
```

---

## Project source of truth

The authoritative specification, architecture audit, verified knowledge base,
and engineering reconnaissance live in `docs/`. Code in this repository must
remain consistent with those documents. Do **not** redesign the product, change
the locked MVP, or rewrite Knowledge Base facts from code.

---

## Environment configuration

Copy `.env.example` to `.env` and fill in placeholder values for local
development. `.env` is ignored by git; `.env.example` is tracked and contains
only placeholders.

---

## Status

This repository is at **Ticket 01 — Repository Foundation**. No application
behaviour has been implemented yet.