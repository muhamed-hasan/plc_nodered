<!-- Sync Impact Report:
- Version Change: 0.0.0 -> 1.0.0
- Modified Principles: Created Config-Driven, Deterministic Behavior, Restart-Safe, Single PLC Topology, Low Latency, Minimal Dependencies
- Added Sections: Constraints, Guarantees, Non-Goals, Tech Stack
- Removed Sections: Generic placeholders
- Templates Required Updates: ✅ plan-template.md (check rules update)
- TODOs: None
-->

# plcVisionControl Constitution

## Core Principles

### I. Config-Driven
All system logic must be driven by configuration files. Hardcoded behavioral logic is prohibited to ensure flexibility without code changes.

### II. Deterministic Behavior
The system must guarantee that the same input always produces the exact same output. State transitions must be predictable.

### III. Restart-Safe
System state must be reconstructed fully from SQLite upon restart. In-memory state without persistence is forbidden for critical operations.

### IV. Single PLC Topology
The system communicates strictly with a single PLC over Modbus TCP. Multi-PLC support is intentionally out of scope.

### V. Low Latency
The processing pipeline MUST guarantee a trigger delay of strictly less than 500ms to ensure real-time responsiveness.

### VI. Minimal Dependencies
Rely only on essential dependencies (e.g., Node.js, SQLite, chokidar, modbus-serial, Next.js) to reduce maintenance burden and security surface.

## Constraints
- **Deployment**: Linux-only environments.
- **Data Store**: SQLite serves as the single overarching source of truth.
- **Security**: No authentication layers (assumed internal tool).
- **Trigger**: The system must trigger evaluation upon ANY recognized file change.

## Guarantees
- At most ONE active timer may exist per coil at any given time.
- No duplicate PLC signals can be transmitted during rapid file change sequences.
- Automatic full recovery of operations must complete successfully following any restart event.

## Non-Goals
- Multi-tenant architectures.
- Distributed or microservice-based deployments.
- Implementation of any complex rule engine.

## Tech Stack
- **Backend**: Node.js
- **Database**: SQLite
- **File Watcher**: chokidar
- **PLC Communication**: modbus-serial
- **Frontend App**: Next.js

## Governance
All amendments to this constitution require documentation of the rationale and version bump. All PRs must comply with these stated guarantees and constraints. 

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
