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

### Endpoints (Ticket 02 Foundation)

- `GET /health` — Returns JSON health status, environment, version, and ISO timestamp.
- `GET /api/v1` — Returns JSON API status and endpoint directory.

---

## Project source of truth

The authoritative specification, architecture audit, verified knowledge base,
and engineering reconnaissance live in `docs/`. Code in this repository must
remain consistent with those documents. Do **not** redesign the product, change
the locked MVP, or rewrite Knowledge Base facts from code.

---

## Known Ticket 02 Boundaries & Limitations

- **No AI endpoints**: OpenAI API integration is deferred to future tickets.
- **In-Memory Session**: Uses the Express MemoryStore for local development and test isolation; replaceable with a distributed store in production.
- **Knowledge Base Data**: The loader safely parses and indexes existing knowledge base structures and gracefully handles `{}` schema placeholders.

---

## Status

This repository is at **Ticket 02 — Backend Foundation**. Core HTTP server, security headers, routing, session foundation, resilient KB loader, and test suite are implemented and verified.