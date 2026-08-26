# GoldenHour ⚡
### India Cyber Fraud First-Response & Emergency Triage Assistant

GoldenHour is a structured, emergency-response web application designed to help victims and witnesses of cyber fraud in India take the right actions in the critical **first 2 hours** ("The Golden Hour") of an incident.

The platform transforms a panicking victim's fragmented recollections into verified emergency actions and ready-to-use artifacts:
1. **1930 Helpline Verbal Call Script** (ready to read out loud to 1930 / bank fraud control operators)
2. **Formal Police Complaint / FIR Draft** (addressed to the local Cyber Crime Police Station SHO citing IT Act Sections 66C & 66D)
3. **NCRP Reference Payload** (structured JSON matching `cybercrime.gov.in` classification taxonomies)

Backed by a verified, non-AI knowledge base grounded in official Indian cybercrime and banking frameworks (MHA, I4C, NCRP, RBI, NPCI, and DoT).

---

## 🎯 The Problem

When a cyber fraud occurs (e.g. UPI QR scam, OTP vishing, phishing link, instant loan extortion), victims experience high stress and lose valuable time:
- **Scattered Information**: Victims struggle to locate 12-digit UTR numbers, exact timestamps, and beneficiary handles.
- **Unclear Priorities**: Victims often file online reviews or wander across websites instead of immediately calling **1930** or their bank.
- **Layering Delay**: In Indian cyber fraud, stolen funds are rapidly transferred through multiple "mule" accounts within minutes to hours. The highest likelihood of an inter-bank freeze via the CFCFRMS network exists in the first **120 minutes**.

---

## 💡 The Solution & Public-Service Reimagination

GoldenHour reimagines the citizen first-response into one guided emergency workflow:
- **2-Minute Structured Intake**: Captures fraud category, occurrence timeline, transaction references (UTR/Txn ID), debited bank, beneficiary targets, and suspect identifiers.
- **Real-Time Golden Hour Triage**: Calculates elapsed minutes and visualizes the urgency window (`GOLDEN_HOUR < 120m` vs `CRITICAL_24H` vs `EXTENDED`).
- **Source-Backed Guidance**: Delivers immediate action checklists, evidence preservation requirements, and official emergency contacts tailored to the specific fraud type.
- **Ready Preparation Artifacts**: Generates copyable and downloadable scripts, complaints, and payload references.

### 🔄 What is Being Reimagined?

| Aspect | Today's Citizen Friction | GoldenHour's Reimagined Journey |
|---|---|---|
| **Initial Reaction** | Panic, disorientation, searching random websites | 1-click triage with computed Golden Hour (<120m) urgency window |
| **Emergency Helplines** | Unclear which numbers to dial or what to say | Tailored **1930 Helpline Verbal Script** with UTRs and key points ready to read |
| **Police Reporting** | Complex legal drafting, unsure which sections apply | Pre-formatted **Formal FIR Complaint Draft** citing IT Act 66C & 66D |
| **Portal Filing** | Manual categorization and repetitive form fields | Structured **NCRP Reference Payload** formatted for `cybercrime.gov.in` |
| **Evidence Preservation** | Screenshots lost or deleted during phone reset | Step-by-step digital evidence preservation checklist tailored to the scam |

---

## 🏛️ Connected to India's Official Public-Service Ecosystem

GoldenHour is an emergency preparation assistant designed around India's authorized cybercrime channels:
- **1930 Helpline (MHA / I4C)**: Emergency hotline for inter-bank transaction freeze via the Citizen Financial Cyber Fraud Reporting and Management System (CFCFRMS).
- **National Cybercrime Portal (`cybercrime.gov.in`)**: Canonical national portal for formal cyber financial fraud complaint filing.
- **Debited Banks & Payment Providers**: Zero-liability dispute reporting within the 3-day RBI window under Circular DBR.No.Leg.BC.78/09.07.005/2017-18.
- **Cyber Police Stations**: Jurisdictional FIR registration under Sections 66C (Identity Theft) & 66D (Cheating by Personation).
- **DoT Sanchar Saathi (Chakshu)**: Direct facility for reporting fraudulent phone numbers, SMS, and WhatsApp handles.

---

## ⚖️ Trust, Disclosures & Safety Boundaries

> **Important Public Notice:**
> - GoldenHour is an **independent emergency triage tool**, not a government agency, bank, or law enforcement authority.
> - GoldenHour **does not directly freeze bank accounts** or guarantee recovery of stolen funds.
> - The 2-hour "Golden Hour" is an operational triage heuristic based on inter-bank CFCFRMS settlement dynamics, not an official statutory classification.
> - Generated FIR complaint drafts and 1930 call scripts are preparation templates that must be reviewed and verified by the citizen before submission.
> - Official complaints must always be registered via **1930** and `https://cybercrime.gov.in`.

---

## 🚀 Judge Quick Start (30-Second Evaluation)

### 1. Prerequisites
- **Node.js**: v20.0.0 or later
- **npm**: v10.0.0 or later

### 2. Build & Start the Application

```bash
# 1. Build frontend client assets
cd frontend
npm run build

# 2. Start the unified server (serves both API and frontend UI on http://localhost:3000)
cd ../backend
npm start
```

### 3. Open in Browser
Visit **`http://localhost:3000/`**

### 4. Judge Demo Walkthrough (5-Second Fast Path)
1. On the landing screen, click **`⚡ Load Judge Demo (UPI Scam)`**.
2. **Notice the Dynamic Urgency Banner**: Computed triage state for an incident 45 mins ago (active Golden Hour window, freeze probability advisory, and immediate mandatory action).
3. **Review Immediate Emergency Guidance**: Category-specific checklist (NPCI rules, 1930 reporting, bank freeze request, evidence preservation).
4. **Explore the 3 Response Artifacts**:
   - **1930 Call Script Tab**: Copy script or click `💾 Download Script (.txt)`.
   - **Formal FIR Complaint Tab**: Review markdown complaint with UTR `UPI/409812739182` and click `💾 Download as .txt`.
   - **NCRP Reference Tab**: Inspect structured JSON payload mapped to `Financial Fraud -> UPI Fraud`.
5. **Test Session Reset**: Click `🔄 Reset Session` to return to a clean state.
6. **Test Real Citizen Intake**: Click `🚨 Start Emergency Intake` to test custom form entry and live validation.

---

## 🧪 Running Automated Tests & Type Checking

The repository includes a comprehensive test suite (Unit, Integration, Security, E2E, Scenario Acceptance, and Smoke tests):

```bash
# Run all backend & scenario test suites (node:test)
cd backend
npm test

# Run TypeScript typechecks
npm run typecheck
cd ../frontend
npm run typecheck
```

---

## 🏗️ Architecture & Technology Stack

```
GoldenHour/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express factory & static frontend serving
│   │   ├── server.ts           # Server bootstrap & graceful shutdown
│   │   ├── config/             # Zod-validated environment config
│   │   ├── incident/           # Incident state store, triage calculator & artifact generator
│   │   ├── kb/                 # Resilient Knowledge Base loader & guidance service
│   │   ├── middleware/         # Logger, 404 handler, centralized error handler
│   │   ├── routes/             # Health check, Incident API, and KB endpoints
│   │   ├── security/           # Helmet security headers, CORS, body limits
│   │   └── session/            # In-memory session store & signed cookie middleware
│   ├── tests/                  # 49+ tests across 15 suites (node:test)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app.ts              # UI controller & DOM event orchestrator
│   │   ├── types.ts            # Frontend TypeScript contracts
│   │   ├── api/                # Typed REST client
│   │   ├── context/            # Reactive incident store & Demo loader
│   │   └── components/         # Header, Landing, Form, UrgencyBanner, Guidance, Artifacts, Footer
│   ├── public/
│   │   ├── index.html          # Semantic HTML5 container
│   │   ├── styles.css          # High-contrast, mobile-first emergency CSS
│   │   └── dist/               # Compiled ES2020 browser modules (generated)
│   └── package.json
├── knowledge-base/             # Verified static facts & source-backed playbooks
│   ├── fraud_playbooks/        # upi_scam, otp_fraud, phishing, fake_loan_app, investment_scam, sim_swap, unknown
│   ├── contacts.json           # 1930, cybercrime.gov.in, 112, RBI Sachet, RBI CMS, DoT Chakshu
│   ├── expectations.json       # Filing standards for Banks (72h), 1930 (2h), and Police FIRs
│   ├── ncrp_mapping.json       # Taxonomy codes & keyword triggers
│   ├── sources.json            # Statutory and regulatory citations
│   └── kb_meta.json            # Knowledge base metadata
├── tests/
│   └── scenarios/              # 10 reproducible JSON scenario fixtures
├── docs/                       # Project specifications & architecture audit
└── README.md
```

---

## 📚 Authoritative Knowledge Base Sources

All guidance and playbooks in `knowledge-base/` are grounded in official Indian statutory and regulatory sources:
- **Ministry of Home Affairs (MHA) & Indian Cybercrime Coordination Centre (I4C)**: National Cyber Crime Helpline `1930` and CFCFRMS inter-bank freeze mechanism (`https://cybercrime.gov.in`).
- **National Cyber Crime Reporting Portal (NCRP)**: Standardized cyber financial fraud taxonomies and complaint filing procedures (`https://cybercrime.gov.in`).
- **Reserve Bank of India (RBI)**: Circular DBR.No.Leg.BC.78/09.07.005/2017-18 (Customer Protection – Limiting Liability in Unauthorised Electronic Banking Transactions) and RBI Sachet portal for illegal lending apps (`https://sachet.rbi.org.in`).
- **National Payments Corporation of India (NPCI)**: UPI transaction safety protocols, PIN entry rules, and dispute resolution workflows (`https://www.npci.org.in`).
- **Department of Telecommunications (DoT)**: Sanchar Saathi and Chakshu citizen reporting facility for telecom fraud (`https://sancharsaathi.gov.in`).
- **Information Technology Act, 2000**: Section 66C (Identity Theft) & Section 66D (Cheating by Personation using Computer Resource).

---

## 📡 REST API Directory

- `GET /` — Serves GoldenHour citizen frontend application.
- `GET /styles.css` — Serves emergency response stylesheets.
- `GET /dist/app.js` — Serves compiled client ES2020 modules.
- `GET /health` — Machine-readable JSON health metadata (`status: "ok"`, version, timestamp).
- `GET /api/v1` — API metadata and available endpoints directory.
- `POST /api/v1/incident/intake` — Validates and records incident details via Zod.
- `GET /api/v1/incident/current` — Returns current session incident and Golden Hour triage assessment.
- `GET /api/v1/incident/guidance` — Returns tailored emergency actions and official helplines.
- `GET /api/v1/incident/artifacts` — Returns generated 1930 call script, NCRP payload, and FIR draft.
- `POST /api/v1/incident/reset` — Resets session state.
- `GET /api/v1/kb/playbooks` — Lists all 7 verified fraud playbooks.
- `GET /api/v1/kb/playbooks/:id` — Returns a specific fraud playbook.
- `GET /api/v1/kb/contacts` — Returns verified emergency contact helplines.
- `GET /api/v1/kb/all` — Returns entire loaded knowledge base tree.

---

## 🏁 Submission Status

This repository is at **Ticket 07 — Final Public-Service Reimagination & Hackathon Submission Readiness**. The complete end-to-end citizen emergency response prototype is verified with 49 automated tests across 15 test suites with 0 failures and 0 external AI dependencies. Ready for hackathon evaluation.