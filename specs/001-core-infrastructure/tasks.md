---
description: "Task list for Phase 1: Core Infrastructure implementation"
---

# Tasks: Core Infrastructure

**Input**: Design documents from `/specs/001-core-infrastructure/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Node.js project (package.json) in `backend/`
- [x] T002 Install dependencies (`express`, `better-sqlite3`, `modbus-serial`, `cors`) in `backend/`
- [x] T003 Configure development scripts (e.g., node --watch) in `backend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup SQLite database initialization logic in `backend/src/models/db.js`
- [x] T005 Setup basic Express server application structure in `backend/src/app.js` and `backend/src/index.js`
- [x] T006 Configure error handling and CORS middleware in `backend/src/app.js`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Configure System Settings (Priority: P1) 🎯 MVP

**Goal**: As an administrator, I want to configure and save the connection settings (PLC IP and port) so the system knows how to communicate with the PLC.

**Independent Test**: Can be fully tested by sending a POST request to `/api/settings` and verifying the response, followed by a GET request to ensure settings persist in the SQLite database.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create settings model with get/update functions and table init script in `backend/src/models/settings.js`
- [x] T008 [US1] Implement GET `/api/settings` endpoint in `backend/src/api/settings.js`
- [x] T009 [US1] Implement POST `/api/settings` endpoint in `backend/src/api/settings.js` with basic validation
- [x] T010 [US1] Mount the settings route in `backend/src/app.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. The configuration API operates on top of the foundation.

---

## Phase 4: User Story 2 - PLC Connection Initialization (Priority: P2)

**Goal**: As a system process, I want to automatically establish a connection to the PLC using saved settings on startup or when settings are updated.

**Independent Test**: Can be fully tested by checking server logs for a successful PLC connection attempt (or connection refused if the PLC isn't running) upon startup or when submitting a valid `/api/settings` POST payload.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create PLC service handling connect, disconnect, and state management using `modbus-serial` in `backend/src/services/plc.js`
- [x] T012 [US2] Implement auto-connect logic on server startup in `backend/src/index.js` leveraging `backend/src/models/settings.js` and `backend/src/services/plc.js`
- [x] T013 [US2] Integrate the reconnect logic into the POST `/api/settings` route in `backend/src/api/settings.js` to apply live connection changes

**Checkpoint**: At this point, the application connects to the PLC utilizing user-provided configurations dynamically. Unreachable PLC components correctly retry or remain ready. Both US1 and US2 work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T014 Review and validate backend error logging to ensure API connection problems report clearly.
- [x] T015 Run quickstart.md validation locally to verify instructions work cleanly on an empty state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - Proceed sequentially from Phase 3 (US1) sequentially into Phase 4 (US2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2). No external dependencies.
- **User Story 2 (P2)**: Can start after US1 or in parallel if stubs are used, however, since T013 modifies US1's router, it is strongly suggested to follow US1 sequentially.

### Parallel Opportunities

- Within Phase 1, `package.json` updates and `npm install` are single-threaded but T001 and T002 effectively execute in parallel.
- Within Phase 3, the database model `backend/src/models/settings.js` can be built in parallel with foundational API routing stubs.
- Within Phase 4, the core PLC interaction logic `backend/src/services/plc.js` can be written while the express `backend/src/api/settings.js` components from Phase 3 are tested by another individual.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify that settings are persistent within the SQLite backend. Submit arbitrary IPs via Postman/CURL.

### Incremental Delivery

1. Follow MVP Steps above.
2. Add User Story 2  → System will now attempt to reach out to the inputted IPs.
3. Verify connection logs or retry mechanisms in console log visually.
