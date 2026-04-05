# Implementation Plan: Restart Recovery & Hardening

**Branch**: `006-restart-recovery` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-restart-recovery/spec.md`

## Summary

Phase 6 implements the core fault-tolerance constraints spanning hardware connectivity failures explicitly handling native auto-polling limits dynamically, while mapping SQLite boot checks synchronously confirming the database perfectly handles reboot state-chains natively.

## Technical Context

**Language/Version**: Node.js 20+
**Primary Dependencies**: `modbus-serial`
**Storage**: N/A for this phase.
**Target Platform**: Linux server
**Project Type**: Node.js Web API
**Performance Goals**: Reconnect intervals bounds mapping strictly every 5 seconds.
**Constraints**: Must never exit zero boundaries fatally (gracefully looping requests).
**Scale/Scope**: Local hardware tooling.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (Yes)
- [x] Is system behavior deterministic? (Yes)
- [x] Is it restart-safe? (Yes, explicitly addressing the constitution bounding rule!)
- [x] Is it strictly single-PLC (Modbus TCP)? (Yes)
- [x] Is trigger latency guaranteed <500ms? (Yes)
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)? (Yes).
- [x] Are we abiding by single-timer-per-coil limit without duplicates? (Yes).

## Project Structure

### Documentation (this feature)

```text
specs/006-restart-recovery/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── index.js         # Modified boot loading sequence protecting initialization
│   └── services/
│       └── plc.js       # Inject polling parameters
```

**Structure Decision**: Extending `plc.js` bounds mapping standard encapsulated background loops.

## Complexity Tracking

*(No violations)*
