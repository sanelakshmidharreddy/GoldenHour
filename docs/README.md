# docs — GoldenHour project source of truth

The `docs/` directory is the authoritative source of truth for the GoldenHour
project. Code in this repository must remain consistent with the documents
placed here.

This ticket only creates the pointer. The canonical documents themselves are
added by their respective owners in their respective tickets:

- `MVP_SPEC.md` — GoldenHour MVP specification (locked; do not change).
- `ARCHITECTURE_AUDIT.md` — Senior architecture audit.
- `ENGINEERING_RECON.md` — Engineering reconnaissance.
- `KNOWLEDGE_BASE.md` — Overview of the verified knowledge base that lives
  under `../knowledge-base/`.

The verified knowledge base itself lives at `../knowledge-base/` and is the
single source of factual claims (helplines, fraud playbooks, NCRP mapping,
contacts, expectations, sources). Application code must consult the knowledge
base — it must not invent or override facts.