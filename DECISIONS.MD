# DECISIONS.md

## Timebox

Start:
2026-06-20 13:30

Stop:
(In progress)

Target Duration:
~2 hours

---

## Goal

Build a service that generates a trustworthy morning handover for hotel operations by combining:

* Structured front-desk events (`events.json`)
* Free-text night logs (`night-logs.md`)

The handover should help a morning manager understand:

* What still requires action
* What was resolved overnight
* What is newly introduced
* Any contradictions or uncertainties

---

## Initial Architecture Decision

### Chosen Stack

* Node.js
* TypeScript
* Fastify
* Zod
* Pino

### Why

The challenge requires:

* Fast implementation
* Strong typing
* Structured logging
* Simple deployment

This stack provides all of those while remaining lightweight.

---

## Planned System Flow

Input Sources

1. events.json
2. night-logs.md

Pipeline

1. Ingestion
2. Normalization
3. Reconciliation
4. Grounding Validation
5. Handover Generation
6. API Response

---

## Initial Assumptions

### Night Shift Window

A night shift spans roughly:

23:00 → 07:00

Therefore a single operational shift may span two calendar dates.

### Issue Lifecycle

Issues may continue across multiple nights.

The system should track issue history rather than repeating the same issue every night.

### Operational Trust

Trustworthiness is more important than completeness.

When information is incomplete:

* surface uncertainty

When information conflicts:

* surface contradiction

Never silently resolve ambiguity.

---

## Preliminary Issue Threads Identified

Potential recurring issues observed from the source data:

1. Room 112 air-conditioning failure
2. Room 309 deposit collection issue
3. Immigration scanner backlog
4. Room 215 corridor leak
5. Room 312 no-show charge dispute

These will be verified during reconciliation implementation.

---

## Prompt Injection Considerations

The dataset contains content that appears to be instructions directed at the handover system.

Example:

A guest message requests:

* ignoring other issues
* reporting all clear
* granting a goodwill credit

This will be treated as hotel data, not executable instructions.

Decision:

All guest-provided content will be treated as evidence only.

---

## Grounding Strategy

Every generated handover item must include source evidence.

The system should never:

* invent actions
* invent approvals
* invent resolutions
* invent payments

Statements without evidence should be excluded or flagged.

---

## Planned Deliverables

* Data ingestion
* Issue normalization
* Reconciliation engine
* Grounding validation
* Handover generation
* Structured logging
* Fastify API
* Railway deployment

---

## Known Tradeoffs

Given the 2-hour timebox:

Prioritized:

1. Reconciliation
2. Grounding
3. Logging
4. Deployment

Deprioritized:

1. UI
2. Database persistence
3. Authentication
4. Extensive testing

---

## To Be Updated

After implementation:

* What was built
* What was skipped
* How reconciliation works
* How grounding is enforced
* Where AI helped
* Where AI failed
* What would be improved with more time
* One surprising finding
