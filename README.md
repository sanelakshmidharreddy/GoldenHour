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

- **Frontend** — TypeScript (web). A framework selection (e.g. React/Vite) will
  be introduced by a later ticket. For now, `frontend/src/` is laid out with
  `components/`, `context/`, and `api/` to receive that work.
- **Backend** — TypeScript (Node 20+) with Express, Helmet, CORS, Zod validation,
  express-session foundation, and Jest test runner.
- **Knowledge Base** — Static, verified JSON under `knowledge-base/`. This is
  the canonical source of facts (helplines, fraud playbooks, NCRP mapping,
  contacts, expectations, sources) and is the only authoritative reference
  the application consults.
- **Tests** — Unit and integration tests under `backend/tests/` using Node 20
  native test runner (`node:test`). `tests/scenarios/` holds reproducible
  fraud-scenario fixtures for future acceptance tests.

---

## High-level repository structure

```
GoldenHour/
  backend/
    src/
      app.ts         # Express app factory & middleware wiring
      server.ts      # HTTP server startup with graceful shutdown
      config/        # Validated environment configuration (Zod)
      kb/            # Resilient Knowledge Base loader & types
      middleware/    # Request logger, 404 handler, centralized error handler
      routes/        # Health check (/health) and API v1 router (/api/v1)
      security/      # Helmet, CORS, body parser limits
      session/       # Session middleware foundation
    tests/           # Backend test suite (health, api, config, security, kb)
    package.json
    tsconfig.json
    tsconfig.test.json
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

## Backend Development

### Installation

```bash
cd backend
npm install
```

### Environment Configuration

Copy `.env.example` to `.env` (or create `.env` in the root/backend):

```bash
cp .env.example .env
```

Configurable variables:
- `PORT` — HTTP port for the backend server (default: `3000`).
- `NODE_ENV` — `development` | `production` | `test` (default: `development`).
- `PUBLIC_BACKEND_ORIGIN` — CORS allowed origin (default: `http://localhost:3000`).
- `KNOWLEDGE_BASE_DIR` — Path to `knowledge-base/` directory (defaults to auto-detected local path).
- `SESSION_SECRET` — Session secret key (required in production; safe default in dev/test).
- `OPENAI_API_KEY` / `OPENAI_MODEL` — Placeholders for future AI ticket.

### Running in Development

```bash
cd backend
npm run dev
```

### Building for Production

```bash
cd backend
npm run build
npm start
```

### Running Tests and Type Checking

```bash
cd backend
npm test          # Run unit & integration test suite (node:test)
npm run typecheck # Run TypeScript compiler in type-check mode
```

### Endpoints (Ticket 03)

- `GET /health` — Returns JSON health status, environment, version, and ISO timestamp.
- `GET /api/v1` — Returns JSON API status and endpoint directory.
- `POST /api/v1/incident/intake` — Submits or updates incident information (financial loss, suspect info, fraud type) with Zod validation.
- `GET /api/v1/incident/current` — Returns current active incident state and Golden Hour urgency status.
- `GET /api/v1/incident/guidance` — Returns tailored emergency steps, 1930 helpline guidance, and evidence checklist.
- `GET /api/v1/incident/artifacts` — Returns generated 1930 call script, NCRP payload reference, and formal FIR complaint draft.
- `POST /api/v1/incident/reset` — Resets active incident state for the session.
- `GET /api/v1/kb/playbooks` — Lists all verified fraud playbooks.
- `GET /api/v1/kb/playbooks/:id` — Returns a specific fraud playbook.
- `GET /api/v1/kb/contacts` — Returns verified emergency contact helplines.

---

## Project source of truth

The authoritative specification, architecture audit, verified knowledge base,
and engineering reconnaissance live in `docs/`. Code in this repository must
remain consistent with those documents. Do **not** redesign the product, change
the locked MVP, or rewrite Knowledge Base facts from code.

---

## Known Ticket 03 Boundaries & Limitations

- **No external AI dependency required**: Deterministic Golden Hour urgency assessment and artifact generation logic are executed locally without external AI API calls.
- **In-Memory Session**: Uses the session foundation for local development and test isolation.
- **Knowledge Base Facts**: Consults static verified facts from `knowledge-base/` and provides safe fallback guidance if JSON files are empty placeholders.

---

## Status

This repository is at **Ticket 03 — Incident Intake, Guidance & Artifacts API**. Core intake, session state management, Golden Hour window assessment, knowledge-base guidance resolution, and 1930/NCRP/FIR artifact generation are implemented and verified with 28 automated tests.