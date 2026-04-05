# Feature Specification: PLC Execution Engine

**Feature Branch**: `004-plc-execution`  
**Created**: 2026-04-05  
**Status**: Draft  
**Input**: User description: "specs for phase 4"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Instantaneous Automation Signaling (Priority: P1)

As an industrial machine operator, I want the system to immediately activate physical machinery (via a PLC coil) the moment a valid, debounced file event resolves, so that there is no perceived delay between a file-generating action and the machine's response.

**Why this priority**: Actuating the physical machine is the fundamental purpose of the application.

**Independent Test**: Simulating a resolved "Watch Event" natively through the system triggers the targeted PLC coil to flip ON cleanly.

**Acceptance Scenarios**:

1. **Given** the PLC system is actively connected and reachable, **When** the execution engine receives a resolved file event target, **Then** a Modbus command is sent to activate (write high/true) on the mapped coil instantly.

---

### User Story 2 - Automated Hardware Reset (Priority: P1)

As a safety and control manager, I want the PLC coil to definitively turn OFF after its configured rule duration expires natively within the new host system, so that external physical switches don't remain stuck indefinitely.

**Why this priority**: Required to conclude a signal cycle and release control back to hardware baselines.

**Independent Test**: Measuring the time between the ON signal and the OFF signal to verify it matches the configured duration exactly.

**Acceptance Scenarios**:

1. **Given** a coil was flipped ON due to a triggered event with a 500ms duration mapping, **When** exactly 500ms elapses from the initial trigger timing, **Then** a Modbus command flips the coil OFF without secondary intervention.

---

### User Story 3 - Rapid Fire Signal Override (Priority: P2)

As a systems engineer, I want rapid continuous triggers targeting the *same* active coil to reset the existing countdown rather than firing duplicate/stacked commands or dropping the signal, so that repeated sustained activity extends the physical ON duration smoothly instead of jittering the output.

**Why this priority**: Highly critical per the project's Core Principles ("no duplicate PLC signals during rapid file changes", "single active timer per coil").

**Independent Test**: Triggering an event for a 2000ms duration, waiting 1000ms, and triggering the same event again results in the coil remaining ON for exactly 3000ms total, accompanied by only a singular OFF output packet.

**Acceptance Scenarios**:

1. **Given** Coil 3 is currently ON and has 1000ms left on its duration timer, **When** a new event mapping to Coil 3 is received with a 2000ms duration, **Then** the initial OFF timer is overridden, and the system now counts down 2000ms from the current moment before shutting OFF. 
2. **Given** the scenario above occurs, **Then** the system does NOT attempt to send an additional duplicate ON signal across the network, just updates the internal duration bounds.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST intercept logical `fileTriggered` events emitted from the File Engine built in Phase 3.
- **FR-002**: System MUST issue Modbus commands exclusively to the configured Modbus port fetched from the active connection profile.
- **FR-003**: System MUST execute target Modbus coil writes (1) asynchronously within microseconds of parsing an event payload.
- **FR-004**: System MUST maintain exactly one maximum active timeout buffer mapped per unique coil index (0 through 7).
- **FR-005**: System MUST write the corresponding Modbus coil OFF (0) once its target duration resolves against the active queue.
- **FR-006**: System MUST silently catch execution transmission errors without fatally halting the main Node.js orchestrator process.

### Key Entities

- **Coil Timer Output Map**:
  - `coil`: The target index.
  - `timeoutHandle`: The OS-level identifier controlling the designated shutdown bounds.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: PLC signal actuation completes <200ms round-trip measuring from the initial logical event trigger across a local Ethernet Modbus simulation test.
- **SC-002**: Passing 15 separate overlapping timer requests internally directed at identical coils results in strictly 1 initial network "ON" invocation and exactly 1 delayed "OFF" invocation with zero overlapping dispatches observed across protocol inspection.
- **SC-003**: Network disconnects simply log internal connection dropped warnings without crashing the execution manager.

## Assumptions

- Assumes existence of `PLCService` class generated loosely in Phase 1 setup holding pure connection state.
- Assumes the network topology handles 0.1ms network resolutions avoiding manual protocol-level queueing inside Node.js.
