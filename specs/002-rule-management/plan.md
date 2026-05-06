# Implementation Plan: Rule Management

**Branch**: `002-rule-management` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-rule-management/spec.md`

## Summary

Phase 2 introduces Rule Management. It implements the CRUD operations for file-to-PLC mapping rules which dictate how file path monitoring triggers PLC coils based on specified durations. The configuration is purely API-driven (Express) backed by the phase 1 SQLite instance.

## Technical Context

**Language/Version**: Node.js 20+  
**Primary Dependencies**: `express`, `better-sqlite3`  
**Storage**: SQLite (`plc_vision.db` local file)  
**Target Platform**: Linux server  
**Project Type**: Backend web service API  
**Constraints**: Robust validation preventing rule duplication or out-of-bound variables  
**Scale/Scope**: Local internal tool, minimal rules expected (hundreds max)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (No hardcoded paths or values)
- [x] Is system behavior deterministic? 
- [x] Is it restart-safe? (State from SQLite)
- [x] Is it strictly single-PLC (Modbus TCP)?
- [x] Is trigger latency guaranteed <500ms? *(Backend CRUD is independent of trigger execution engine)*
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)?
- [x] Are we abiding by single-timer-per-coil limit without duplicates? *(Execution constraint, not CRUD constraint)*

## Project Structure

### Documentation (this feature)

```text
specs/002-rule-management/
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
│   ├── models/       # rules.js model
│   ├── api/          # rules.js resource logic
│   └── app.js        # Router injection
```

**Structure Decision**: Expanding the `backend/` component from Phase 1 by dropping in a new model and a new `/api/rules` routing controller.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*
