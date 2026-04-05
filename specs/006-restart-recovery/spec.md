# Feature Specification: Restart Recovery & Hardening

**Feature Branch**: `006-restart-recovery`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "specs for phase 6"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Stateless System Rehydration (Priority: P1)

As a sysadmin, I want the node process to automatically reload all configuration schemas (PLC connection info and file watcher rules) derived purely from persistent storage upon any arbitrary application boot, so that unexpected server crashes do not lose monitoring capabilities or require manual startup configuration.

**Acceptance Scenarios**:

1. **Given** a server reboot has just completed, **When** the node process starts, **Then** all active rules mapped to `enabled=1` in the database dynamically configure active file bounds before accepting file triggers.
2. **Given** an unexpected application crash occurs while timers exist, **When** the application restarts, **Then** timer queues natively drop out without duplication limits persisting physically unbounded.

---

### User Story 2 - Resilient Network Connections (Priority: P1)

As a hardware engineer, I want the system to continuously attempt PLC connectivity after brief physical disconnections, so that a fleeting network issue across the factory floor doesn't fatally sever the connection requirement for the lifespan of the running Node application.

**Acceptance Scenarios**:

1. **Given** the system is actively running, **When** the network switch momentarily drops disconnecting the PLC, **Then** the UI natively exposes the drop and gracefully catches Modbus request failures holding the "disconnected" state.
2. **Given** the connection has failed previously, **When** the network path resolves, **Then** physical connection attempts re-evaluate successfully restoring normal bounds automatically.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST query the database on core process initialisation wrapping rules directly into the Watcher module seamlessly bypassing manual setup routing.
- **FR-002**: System MUST catch closed socket structures explicitly establishing asynchronous polling intervals natively attempting reconnection thresholds if a valid target IP string is matched in central storage.
- **FR-003**: System MUST NOT attempt to hold memory states across boots. All timer properties wipe cleanly allowing local payloads to assert entirely fresh timelines.

### Key Entities

- **Reconnection Polling Strategy**:
  - `interval_ms`: Fixed timeout boundaries spanning network recovery iterations.
  - `max_retries`: Infinite bounding.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A process terminating naturally and subsequently rebooting resolves memory hooks restoring all monitoring paths within <1.5s total duration.
- **SC-002**: If hardware targets drop offline, application recovers active connection handling automatically without manual restarts capturing >95% of subsequent physical triggers after hardware returns safely.
- **SC-003**: System accurately validates no edge-cases producing duplicate background event listeners across multi-boot paradigms scaling.

## Assumptions
- Assumes the underlying operating system (Linux) correctly manages generic Node process lifecycles (pm2 or systemd) enabling automatic restarts seamlessly; this module solely addresses the Node layer's reaction post-startup.
