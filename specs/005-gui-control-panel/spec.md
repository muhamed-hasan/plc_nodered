# Feature Specification: Manual Control & Diagnostics

**Feature Branch**: `005-gui-control-panel`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "specs for phase 5"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Coil Control Interface (Priority: P1)

As an operations manager, I want an interface to manually toggle specific physical output coils (ON or OFF) directly bypassing the automated file watcher logic, so that I can immediately debug physical wire connections or override failed states without manufacturing fake file inputs.

**Independent Test**: Toggling the interface mechanism targeting Coil `3` causes the physical relay to latch and hold indefinitely until manually released.

**Acceptance Scenarios**:

1. **Given** the dashboard is loaded, **When** I trigger an action to manually turn Coil `3` ON, **Then** the hardware outputs high indefinitely until I explicitly toggle it OFF or a separate automated trigger bounds it.
2. **Given** I manually toggled Coil `3` OFF, **Then** the machinery ceases output immediately.

---

### User Story 2 - System Activity Traceability (Priority: P1)

As a systems engineer troubleshooting broken execution chains, I want a live diagnostic panel aggregating system activities across file triggers, Modbus dispatches, and rule parses so that I can see exactly what logical step failed on one screen.

**Independent Test**: Executing a standard backend logic trip explicitly prints a matching human-readable transcript onto the UI within a second.

**Acceptance Scenarios**:

1. **Given** the diagnostics panel is open, **When** an automated background file edit occurs, **Then** a visible log string instantly appears identifying the file trigger, matching rule parsing, and Modbus hardware dispatch sequentially.
2. **Given** the hardware is offline, **When** a trigger fires, **Then** the UI explicitly displays the failure bounds instead of completely freezing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a manual invocation mechanism enabling raw boolean (ON/OFF) parameter dispatches targeting indices `0` through `7` independently.
- **FR-002**: System MUST capture background runtime log messages (file triggers, hardware overrides, and connectivity warnings) and expose them continuously.
- **FR-003**: System MUST NOT crash or loop if the manual override specifies a coil already actively bound by an automated background timeout (re-trigger bounds are maintained dynamically).

### Key Entities

- **Diagnostic Stream**:
  - `timestamp`: Event precise bounding time.
  - `type`: "INFO", "WARN", "ERROR".
  - `message`: Payload contents describing action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user pushing a manual override button resolves via hardware endpoints within <500ms measuring end-to-end user timing.
- **SC-002**: Server-side events are propagated onto the readable interface with <1 second latency.
- **SC-003**: Interface successfully maintains diagnostic feeds across 100+ consecutive rapid messages without stalling rendering pipelines.

## Assumptions
- Assumes the hardware architecture supports arbitrary un-bounded toggles (manual overrides are completely permissible).
- Assumes internal logging pipes currently bridging output to `console.log` can be natively rerouted towards exposed sockets or readable API streams safely.
