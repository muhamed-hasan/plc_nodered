# Implementation Plan: Core Infrastructure

**Branch**: `001-core-infrastructure` | **Date**: 2026-04-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-core-infrastructure/spec.md`

## Summary

This phase establishes the backend foundation and persistence layer for the plcVisionControl system. It sets up the Node.js server, integrates SQLite for storing system settings, exposes basic API endpoints to configure the Modbus TCP PLC connection, and implements the initialization routine to connect to the single PLC using those settings on startup.

## Technical Context

**Language/Version**: Node.js 20+  
**Primary Dependencies**: `express` (HTTP API), `better-sqlite3` (Database), `modbus-serial` (PLC Communication)  
**Storage**: SQLite (`plc_vision.db` local file)  
**Testing**: `jest`, `supertest`  
**Target Platform**: Linux server  
**Project Type**: Backend web service (Frontend will be handled in later phases)  
**Performance Goals**: Server starts `< 2s`  
**Constraints**: Single PLC connection, synchronous fast database operations  
**Scale/Scope**: Local internal tool, no auth  

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (No hardcoded paths or values)
- [x] Is system behavior deterministic? 
- [x] Is it restart-safe? (State from SQLite)
- [x] Is it strictly single-PLC (Modbus TCP)?
- [x] Is trigger latency guaranteed <500ms? *(N/A for Phase 1, but architecture permits)*
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)?
- [x] Are we abiding by single-timer-per-coil limit without duplicates? *(N/A for Phase 1)*

## Project Structure

### Documentation (this feature)

```text
specs/001-core-infrastructure/
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
│   ├── models/       # Database interactions (SQLite)
│   ├── services/     # PLC Modbus connection logic
│   └── api/          # Express route handlers
└── tests/
```

**Structure Decision**: Selected the Web application (backend-centric for this phase) approach, storing code in a `backend/` directory to separate it from the future Next.js `frontend/` directory.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*
