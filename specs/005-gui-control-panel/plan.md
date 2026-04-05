# Implementation Plan: PLC Execution Engine

**Branch**: `005-gui-control-panel` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-gui-control-panel/spec.md`

## Summary

Phase 5 introduces the graphical operations toolset defined in the initial project plan. We will scaffold a Next.js web application consuming basic static CSS that binds directly to the active `backend` Node process via a new array of operational manual endpoints and a unidirectional Server-Sent Event (SSE) logging stream.

## Technical Context

**Language/Version**: Node.js 20+; Next.js 14+
**Primary Dependencies**: `next`, `react`. No styling frameworks (Vanilla CSS).  
**Storage**: N/A for this phase.
**Target Platform**: Linux server; Modern Web Browsers
**Project Type**: Next.js App / Node.js Web API
**Performance Goals**: SSE streaming latency <1 second.
**Constraints**: Bypassing background file queue without crashing hardware nodes.
**Scale/Scope**: Local hardware tooling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (Yes)
- [x] Is system behavior deterministic? (Yes)
- [x] Is it restart-safe? (Yes)
- [x] Is it strictly single-PLC (Modbus TCP)? (Yes)
- [x] Is trigger latency guaranteed <500ms? (Yes)
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)? (Yes, explicitly provisioning the Next.js target required by constitution).
- [x] Are we abiding by single-timer-per-coil limit without duplicates? (Yes, manual override endpoints will be strictly separated from automated duration queues).

## Project Structure

### Documentation (this feature)

```text
specs/005-gui-control-panel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   ├── manual.js    # Binds manual Modbus execution API
│   │   └── logs.js      # Exposes Server-Sent Events stream
│   └── index.js         # Mounts the new routes

frontend/                # NEW Application Block
├── src/
│   ├── app/
│   │   ├── layout.js
│   │   ├── page.js      # Dashboard Hub
│   │   └── globals.css
│   └── components/
│       ├── CoilControl.js
│       └── LogTerminal.js
```

**Structure Decision**: Utilizing Option 2 (Web application) establishing the formal frontend and extending the pre-existing backend express server with matching external APIs.

## Complexity Tracking

*(No violations)*
