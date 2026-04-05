# Phase 0: Research & Decisions

## Context
Phase 5 introduces a GUI Dashboard alongside manual network trigger APIs and log streaming to provide real-time hardware visibility.

## Decisions

### 1. Log Streaming Architecture
- **Decision**: Server-Sent Events (SSE) bound to `eventBus`.
- **Rationale**: WebSockets are overkill for a unidirectional log pipe. Standard SSE natively bridges Node `EventEmitter` payloads to HTTP streams in Next.js without requiring third-party libraries (e.g. `socket.io`). We will augment `executor.js` and `watcher.js` to emit `log` payloads onto `eventBus` alongside their `console.log` statements.
- **Alternatives considered**: HTTP polling. Rejected due to latency > 1s threshold requested in User Story 2.

### 2. Frontend Framework Setup
- **Decision**: Next.js App Router (Vanilla CSS).
- **Rationale**: Formally requested via the tech stack rules strictly defined in the `constitution.md`. We will scaffold the Next.js app in a new `frontend/` directory connecting backend REST routes.
