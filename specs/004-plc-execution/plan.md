# Implementation Plan: PLC Execution Engine

**Branch**: `004-plc-execution` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-plc-execution/spec.md`

## Summary

Phase 4 introduces the PLC Execution Engine. It consumes the isolated `fileTriggered` logical payloads from the internal `eventBus`, actuates physical machinery logic via `modbus-serial`, and binds internal OS hardware limits to safely execute "ON", "HOLD", and "OFF" boundaries asynchronously.

## Technical Context

**Language/Version**: Node.js 20+  
**Primary Dependencies**: `modbus-serial` (already integrated into Phase 1)  
**Storage**: Transient runtime OS states (Maps for bounding hardware timers)
**Target Platform**: Linux server linking to physical PLC IPs
**Project Type**: Backend Node.js process / Web Service
**Constraints**: <500ms PLC latency requirement (SC-001 hits <200ms); one timer per coil maximum
**Scale/Scope**: Local hardware tool routing maximum 8 physical coils simultaneously

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (Yes, coil mapped parameters pull straight from db-provided events)
- [x] Is system behavior deterministic? (Yes, overriding the "OFF" queue keeps standard boolean state linear)
- [x] Is it restart-safe? (Yes, volatile memory for queue states inherently wipes without risk)
- [x] Is it strictly single-PLC (Modbus TCP)? (Yes, running off `PLCService.client`)
- [x] Is trigger latency guaranteed <500ms? (Yes)
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)? (Yes)
- [x] Are we abiding by single-timer-per-coil limit without duplicates? (Yes, heavily strictly enforced per coil array)

## Project Structure

### Documentation (this feature)

```text
specs/004-plc-execution/
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
│   ├── services/
│   │   ├── executor.js    # Consumes eventBus and marshals modbus-serial states
│   │   └── plc.js         # Existing modbus connector injected directly
│   └── index.js           # Launcher binding
```

**Structure Decision**: A new `backend/src/services/executor.js` handling logic bridging rather than bolting state onto the pure networking `plc.js` singleton.

## Complexity Tracking

*(No violations)*
