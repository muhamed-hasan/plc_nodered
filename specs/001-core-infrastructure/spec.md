# Feature Specification: Core Infrastructure

**Feature Branch**: `001-core-infrastructure`  
**Created**: 2026-04-04
**Status**: Draft  
**Input**: User description: "read plan.md create specs for phase 1"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Configure System Settings (Priority: P1)

As an administrator, I want to configure and save the connection settings (PLC IP and port) so the system knows how to communicate with the PLC.

**Why this priority**: Without configuring the PLC connection details, the system cannot initialize communications, making it completely useless.

**Independent Test**: Can be fully tested by sending an API request to save settings, and verifying they persist in the database and are loaded upon restart.

**Acceptance Scenarios**:

1. **Given** a fresh system state, **When** I provide valid PLC IP and port settings via the API, **Then** the settings are saved successfully and persisted in SQLite.
2. **Given** saved settings, **When** the system restarts, **Then** it automatically loads the last saved connection settings.

---

### User Story 2 - PLC Connection Initialization (Priority: P2)

As a system process, I want to automatically establish a connection to the PLC using saved settings on startup or when settings are updated, so that downstream control logic can operate.

**Why this priority**: A stable connection to the single PLC is the foundation for all engine execution triggers. It must recover seamlessly.

**Independent Test**: Can be fully tested by verifying the backend successfully connects to a PLC endpoint after starting up with valid settings.

**Acceptance Scenarios**:

1. **Given** valid saved settings, **When** the server starts, **Then** it attempts and successfully connects to the PLC.
2. **Given** a severed PLC connection, **When** the PLC becomes available again, **Then** the system reconnects after restart or retries.

### Edge Cases

- What happens when invalid IP/port configurations are provided? (API must reject with validation errors)
- How does the system handle SQLite write lock or IO errors during settings update? (Return cleanly with error state)
- What happens if the PLC is offline on startup? (System must start successfully but log PLC connection failure and setup retry loop)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST start up a backend server capable of exposing HTTP API endpoints.
- **FR-002**: System MUST integrate with a local database for persistent storage.
- **FR-003**: System MUST provide an API endpoint to update global settings (e.g., PLC IP address, PLC Modbus port).
- **FR-004**: System MUST provide an API endpoint to retrieve current global settings.
- **FR-005**: System MUST initialize a PLC Modbus TCP connection using the saved settings on startup.
- **FR-006**: System MUST remain available to update settings if the PLC is unreachable on startup.

### Key Entities 

- **Settings**: Represents the global configuration needed to operate the system. Attributes: `plc_ip_address` (string), `plc_port` (integer).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The local server process starts successfully and is ready to accept requests in under 2 seconds.
- **SC-002**: Configuration changes to Settings are durably persisted to the database and survive a complete process restart 100% of the time.
- **SC-003**: A PLC connection can be actively established using the saved IP and port configuration.
- **SC-004**: System successfully recovers its connection configuration after a restart.

## Assumptions

- The API is strictly internal and does not require authentication or authorization.
- The PLC speaks standard Modbus TCP.
- The environment provides Linux with sufficient permissions to read/write the database file on disk.
