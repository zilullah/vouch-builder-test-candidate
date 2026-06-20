# Vouch Builder Test Submission

## Deliverables

- **GitHub Repository**: `[PLACEHOLDER FOR GITHUB URL]`
- **Deployment URL**: `[PLACEHOLDER FOR Vercel DOMAIN]`

## Usage

### Health Check
```bash
curl -X GET https://vouch-builder-test-candidate-production.up.railway.app/health
```

### Generate Handover
```bash
curl -X POST https://vouch-builder-test-candidate-production.up.railway.app/handover \
  -H "Content-Type: application/json" \
  -d '{"hotelId":"lumen-sg"}'
```

## Architecture Summary

The backend is built as a highly deterministic data pipeline using **Node.js, TypeScript, Fastify, Zod, and Pino**.

1. **Ingestion**: Strict Zod validation on JSON; raw string extraction for Markdown.
2. **Normalization**: Flattens diverse inputs into a unified `Issue` model, retaining a 1:1 link to raw `Evidence`.
3. **Reconciliation**: Groups `Issue` objects into `IssueThread`s deterministically by Room or Type across an inferred 12-hour shift boundary.
4. **Grounding**: Evaluates threads for safety (Contradictions, Missing Info, Prompt Injection). Converts raw text into `GroundedStatement`s without LLM summarization.
5. **Handover**: Routes threads into action-first operational buckets (`highPriority`, `newlyResolved`, `informational`).
6. **API**: `HandoverFormatter` securely strips all technical metadata before emitting the JSON response.

## Known Limitations

- **In-Memory Processing**: The system currently loads local files (`events.json`, `night-logs.md`) per request. In a real-world scenario, this data stream would come from a database (PostgreSQL) or event queue (Kafka).
- **Hardcoded Room Detection**: The markdown parsing relies on RegEx to find room numbers (e.g. `/(?:room|房)\s*(\d{3})/i`). This works for the test dataset but is brittle across 500+ properties.
- **No Persistence**: Issue threads are recalculated from scratch on every request. Statuses do not persist across server reboots.

## Future Improvements (Hours 3-6)

1. **Database Integration (PostgreSQL)**: Persisting the `IssueThread` state so that morning managers can click "Acknowledge" or "Resolve", moving the state machine forward in a database rather than purely in-memory.
2. **Small LLM for NER**: Using a small, localized LLM (like Llama 3 8B) during the "Normalization" phase purely for Named Entity Recognition (NER) to reliably extract room numbers and guest names from unstructured text, feeding that into the deterministic reconciliation engine.
3. **Authentication**: Adding JWT validation to the `/handover` endpoint to ensure only authorized property managers can pull their respective `hotelId` data.
