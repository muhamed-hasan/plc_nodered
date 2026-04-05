# Feature Specification: File Watcher Engine

**Feature Branch**: `003-file-watcher`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "Phase 3 — File Watcher Engine"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - File Monitoring and Change Detection (Priority: P1)

As an automated process acting on behalf of the operations team, I want the system to continuously monitor specified file paths for changes, so that any updates to a file are immediately detected without manual interference.

**Why this priority**: Core engine functionality. Without change detection, rules cannot trigger PLC actions.

**Independent Test**: Can be fully tested by creating/modifying a watched file on disk and verifying the change event is caught by the engine logs.

**Acceptance Scenarios**:

1. **Given** an enabled rule mapping to a specific file path, **When** the file is created or modified on the host operating system, **Then** the file watcher detects the change event.
2. **Given** a rule points to a file path that does not currently exist, **When** the system starts up or the rule is registered, **Then** the system gracefully waits until the file is created and detects it immediately upon birth.

---

### User Story 2 - Trigger Debouncing (Event Storm Protection) (Priority: P1)

As an administrator, I want rapid successive changes to a single file to be grouped into a single logical trigger event, so that the underlying PLC control logic isn't overwhelmed by redundant or rapid-fire actions (an "event storm").

**Why this priority**: Guarantees deterministic, clean system behavior and respects the Constitution's "single timer per coil without duplicates" principle inherently at the event generation level.

**Independent Test**: Can be tested by rapidly modifying a single watched file 10 times in 50ms and verifying only one final logical event signature is emitted to the target system boundary.

**Acceptance Scenarios**:

1. **Given** the file watch engine is active, **When** a monitored file is modified multiple times rapidly within roughly a 300ms window, **Then** only a single, consolidated trigger event is generated and forwarded to the execution system.

---

### User Story 3 - Event Logging Emission (Priority: P2)

As a system diagnostician, I want all resolved file triggers to be logged persistently, so that I have a clear audit trail of what file activities resolved into actionable events.

**Why this priority**: Required for basic observability as stated in the project goals (Phase 5 will extend this, but logging infrastructure begins here).

**Independent Test**: Can be tested by verifying log outputs after triggering a valid, debounced file event.

**Acceptance Scenarios**:

1. **Given** a valid file change successfully passes debounce validation, **When** the logical event is fired, **Then** a system log entry is generated indicating the exact file path and timestamp of the triggered change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST monitor all file paths configured in currently enabled rules (via the SQLite source).
- **FR-002**: System MUST dynamically attach or detach file watchers within 10 seconds of a rule being created, updated, or deleted without restarting the system.
- **FR-003**: System MUST trigger on *any* content change to a watched file.
- **FR-004**: System MUST apply a debounce window (approximately 300ms) to all detected rapid localized file events to prevent duplicate outputs.
- **FR-005**: System MUST emit an internal logical event representing a concrete "Action Needed" signature once debounce is complete.
- **FR-006**: System MUST not crash if standard file read locks are encountered during external write processes; it should gracefully wait and recover.
- **FR-007**: System MUST log actionable events definitively to the console/system logs.

### Key Entities

- **Watch Event**: An internal logical entity confirming a file change passed debounce checks, containing:
  - `file_path`: Path that triggered the event.
  - `timestamp`: Time the logical event was resolved.
  - `rule_id`: Associated rule ID.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: File changes generate a logical trigger event in the system <50ms after the operating system finalizes the file write plus the configured debounce window.
- **SC-002**: Simulating 100 simultaneous tiny file writes in <200ms on a single target produces exactly 1 emitted, consolidated downstream event.
- **SC-003**: 100% of generated triggered events are permanently recorded into the backend logging output.

## Assumptions

- We are assuming Node.js standard process logging is sufficient to fulfill FR-007 at this phase.
- File writes will primarily happen by an external manufacturing vision capture process rather than human typing, which strongly emphasizes the necessity of the debounce.
