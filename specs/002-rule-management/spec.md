# Feature Specification: Rule Management

**Feature Branch**: `002-rule-management`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "create specs for phase 2"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a File-to-PLC Rule (Priority: P1)

As an administrator, I want to create a new rule mapping a specific file path to a PLC coil with a configured duration, so that changes to that file trigger the respective PLC action.

**Why this priority**: Without rules, the system has no criteria to trigger PLC actions, making it non-functional.

**Independent Test**: Can be fully tested by creating a rule and verifying it appears in the system data store.

**Acceptance Scenarios**:

1. **Given** valid inputs (file path, coil index 0-7, and duration in milliseconds), **When** I submit the rule creation request, **Then** the rule is saved and marked as enabled by default.
2. **Given** duplicate or overlapping file path rules, **When** I attempt to create the rule, **Then** the system rejects the submission with a clear error preventing conflicts.
3. **Given** an invalid coil index (e.g., 8), **When** I submit the request, **Then** the system rejects it safely.

---

### User Story 2 - List and View Rules (Priority: P1)

As an administrator, I want to view all configured rules so that I can audit current mappings and statuses.

**Why this priority**: Required for basic observability of what the system is configured to do.

**Independent Test**: Can be tested by retrieving the list of rules and verifying it matches the stored data.

**Acceptance Scenarios**:

1. **Given** multiple rules exist in the system, **When** I request the list of rules, **Then** I receive all rules with their file paths, coils, durations, and enabled statuses.

---

### User Story 3 - Update an Existing Rule (Priority: P2)

As an administrator, I want to modify an existing rule's properties, so that I can adjust timings or targets without deleting and recreating it.

**Why this priority**: Reduces friction in managing rules but is slightly less critical than creation.

**Independent Test**: Can be tested by modifying a rule's duration and verifying the newly returned value.

**Acceptance Scenarios**:

1. **Given** an existing rule, **When** I update its duration, **Then** the changes are saved to the system.
2. **Given** an existing rule, **When** I change its target coil to a valid index, **Then** the system updates it.

---

### User Story 4 - Toggle Rule Status (Enable/Disable) (Priority: P2)

As an administrator, I want to quickly enable or disable a rule without deleting it, so that I can temporarily bypass triggers during maintenance.

**Why this priority**: Common operational need for factory floor management.

**Independent Test**: Can be tested by toggling the boolean status of a rule and verifying it persists.

**Acceptance Scenarios**:

1. **Given** an enabled rule, **When** I toggle its status, **Then** it becomes disabled in the system state.

---

### User Story 5 - Delete a Rule (Priority: P3)

As an administrator, I want to remove obsolete rules so that they no longer clutter the configuration.

**Why this priority**: Prevents long-term configuration drift, but users can simply disable rules as a workaround initially.

**Independent Test**: Can be tested by deleting a rule and verifying it no longer appears in the list.

**Acceptance Scenarios**:

1. **Given** an active rule, **When** I delete it, **Then** it is permanently removed from the data store.

### Edge Cases

- What happens if the specified file path does not currently exist on the drive? (The system accepts the rule; file watcher engine in a later phase will handle missing files gracefully).
- How are concurrent updates handled? (Last write wins; standard synchronous data store behavior).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a mechanism to create a new mapping rule.
- **FR-002**: System MUST validate rule inputs: Coil must be an integer between 0 and 7 inclusive.
- **FR-003**: System MUST validate rule inputs: Duration must be a positive integer representing milliseconds.
- **FR-004**: System MUST validate rule inputs: File paths must not be duplicated across rules.
- **FR-005**: System MUST persist all rules dependably so they survive arbitrary system restarts.
- **FR-006**: System MUST provide a mechanism to retrieve all current rules.
- **FR-007**: System MUST provide a mechanism to update existing rule properties (path, coil, duration).
- **FR-008**: System MUST provide a mechanism to toggle the 'enabled' boolean state of any rule.
- **FR-009**: System MUST provide a mechanism to delete a rule by its unique identifier.

### Key Entities

- **Rule**: Represents a trigger mapping.
  - `id`: Unique identifier
  - `file_path`: Absolute path to monitor
  - `coil`: PLC coil index (0-7)
  - `duration`: Time in milliseconds to activate the coil
  - `enabled`: Boolean state dictating if the rule is active

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Administrators can successfully create, read, update, and delete rules.
- **SC-002**: 100% of rule configurations are fully restored upon system restart from the persistent data store.
- **SC-003**: System flawlessly rejects 100% of invalid rule creation attempts (e.g., out-of-bounds coils) without crashing.
- **SC-004**: Users can toggle rule states instantly, taking effect on the underlying data representation.

## Assumptions

- No specialized UI needs to be specified yet; standard interface mechanisms (like API endpoints) are sufficient to fulfill these requirements initially.
- The constraint of "coils 0-7" implies standard 8-channel PLC hardware constraints.
