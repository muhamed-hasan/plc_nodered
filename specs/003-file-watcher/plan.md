# Implementation Plan: File Watcher Engine

**Branch**: `003-file-watcher` | **Date**: 2026-04-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-file-watcher/spec.md`

## Summary

Phase 3 introduces the File Watcher Engine. It utilizes `chokidar` to monitor specific file paths designated by the active rules, detects filesystem changes, applies a standard 300ms debounce to prevent event storms, and emits logical trigger events down to a persistent auditing log.

## Technical Context

**Language/Version**: Node.js 20+  
**Primary Dependencies**: `chokidar` (external watcher module)  
**Storage**: N/A for raw files (Configuration comes from existing `better-sqlite3` `Rules` model)  
**Target Platform**: Linux server  
**Project Type**: Backend Node.js process / Web Service
**Constraints**: <50ms processing post-debounce latency; 100% crash resistance to read locks  
**Scale/Scope**: Local internal tool, minimal rules expected (hundreds max file descriptors)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Is logic fully config-driven? (Yes, paths pulled from DB)
- [x] Is system behavior deterministic? (Yes, debouncing ensures linear time-bounded resolution)
- [x] Is it restart-safe? (Yes, rebuilds watchers from DB on startup)
- [x] Is it strictly single-PLC (Modbus TCP)? (Yes)
- [x] Is trigger latency guaranteed <500ms? (Yes, 300ms debounce + <50ms processing)
- [x] Are we using the restricted tech stack (Node.js, SQLite, Next.js, etc.)? (Yes, adding standard `chokidar` library logic)
- [x] Are we abiding by single-timer-per-coil limit without duplicates? (Yes, debounce at this edge prevents duplicates)

## Project Structure

### Documentation (this feature)

```text
specs/003-file-watcher/
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
│   │   ├── watcher.js     # Engine wrapping chokidar
│   │   └── eventBus.js    # Basic Node EventEmitter for bridging watcher to execution logic
│   └── index.js           # Launch binding
```

**Structure Decision**: A new `backend/src/services/watcher.js` module running asynchronously inside our existing Node.js environment. We will also initialize a native Node EventEmitter `eventBus.js` to decouple this module from the Phase 4 execution layer.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*(No violations)*
