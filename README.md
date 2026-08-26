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

### Running the Full Application (Frontend + Backend)

```bash
# 1. Build frontend client assets
cd frontend
npm run build

# 2. Start the backend server (serves both API and frontend UI on http://localhost:3000)
cd ../backend
npm start
```

### Running Tests and Type Checking

```bash
# Backend tests & typecheck
cd backend
npm test          # Run unit, integration & E2E test suites (node:test)
npm run typecheck # Run TypeScript compiler in type-check mode

# Frontend typecheck & build
cd ../frontend
npm run typecheck # Run TypeScript compiler on frontend source
npm run build     # Compile TypeScript to public/dist/
```

### Endpoints (Ticket 04)

- `GET /` — Serves GoldenHour citizen frontend application.
- `GET /styles.css` — Serves emergency response stylesheet.
- `GET /dist/app.js` — Serves compiled frontend application module.
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

## Knowledge Base Sources

Knowledge Base facts in `knowledge-base/` are source-backed from official Indian regulatory and cybercrime authorities:
- **Ministry of Home Affairs (MHA) & Indian Cybercrime Coordination Centre (I4C)**: Operates the National Cyber Crime Helpline `1930` and the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS) for inter-bank transaction freeze requests (`https://cybercrime.gov.in`).
- **National Cyber Crime Reporting Portal (NCRP)**: Canonical categories for cyber financial fraud, incident filing requirements, and evidence preservation standards (`https://cybercrime.gov.in`).
- **Reserve Bank of India (RBI)**: Customer liability framework under RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18 for unauthorized electronic banking transactions (zero liability when reported to bank within 3 working days), and RBI Sachet portal for illegal lending apps (`https://sachet.rbi.org.in`).
- **National Payments Corporation of India (NPCI)**: UPI transaction protocols, dispute resolution workflows, and PIN entry safety rules (`https://www.npci.org.in`).
- **Department of Telecommunications (DoT)**: Sanchar Saathi and Chakshu citizen facility for reporting fraudulent calls, SMS, and SIM swap prevention (`https://sancharsaathi.gov.in`).

> **Notice & Disclaimers:**
> - GoldenHour provides emergency response guidance, triage calculations, and structured templates; it is **not** a government agency and does not directly freeze bank accounts or guarantee fund recovery.
> - Generated FIR complaint drafts and 1930 scripts are reference templates that must be reviewed and verified by the citizen before submission.
> - Emergency contacts should be verified against official government sources before production deployment.

---

## Known Ticket 05 Boundaries & Critical Disclosures

- **Source-Backed Guidance**: All 7 fraud playbooks (`upi_scam`, `otp_fraud`, `phishing`, `fake_loan_app`, `investment_scam`, `sim_swap`, `unknown`) and 5 core fact files contain source metadata mapped to official Indian regulatory frameworks.
- **Scenario Acceptance Coverage**: Validated with 10 reproducible scenarios in `tests/scenarios/` covering immediate triage, evidence checklists, validation rejection, and resilient empty-KB fallback.
- **Emergency First-Response Triage**: GoldenHour helps citizens capture information and format ready-to-use artifacts in the critical 2-hour Golden Hour window without external AI dependencies.
- **Judge Demo Mode**: An instant "Load Demo Scenario" button is available on the frontend landing screen to experience the complete triage journey in seconds.

---

## Status

This repository is at **Ticket 05 — Knowledge Base Content + Scenario Acceptance Tests**. The knowledge base is fully populated with verified Indian cyber-fraud response facts and playbooks, and verified with 43 automated tests across 14 test suites.