---
description: "Task list for Phase 2: Rule Management implementation"
---

# Tasks: Rule Management

**Input**: Design documents from `/specs/002-rule-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No new infrastructure setup required. Leveraging Phase 1 Express and SQLite backend)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 Update SQLite database initialization logic in `backend/src/models/db.js` to create the `rules` table `(id, file_path, coil, duration, enabled)`.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Create a File-to-PLC Rule (Priority: P1) 🎯 MVP

**Goal**: Admins can create a new file-to-PLC mapping rule defining file paths, coils, durations, and state.

**Independent Test**: Send a matching POST request to `/api/rules` and verify HTTP 201 response. Inspect `plc_vision.db` directly to ensure data saved.

### Implementation for User Story 1

- [ ] T002 [P] [US1] Create Rules model in `backend/src/models/rules.js` and implement the `create` method.
- [ ] T003 [P] [US1] Create API router in `backend/src/api/rules.js` and implement the POST `/api/rules` endpoing with input validations.
- [ ] T004 [US1] Mount the `/api/rules` router inside `backend/src/app.js`.

**Checkpoint**: US1 fully functioning. Admins can successfully write new rules to the database.

---

## Phase 4: User Story 2 - List and View Rules (Priority: P1)

**Goal**: Admins can view all configured rules to audit current mappings and statuses.

**Independent Test**: Send a GET request to `/api/rules` and verify the array output matches the created database entries from US1.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Implement the `getAll` method in `backend/src/models/rules.js`.
- [ ] T006 [P] [US2] Implement the GET `/api/rules` endpoint in `backend/src/api/rules.js`.

**Checkpoint**: Core Read/Write abilities completed.

---

## Phase 5: User Story 3 & 4 - Update / Toggle Rule (Priority: P2)

**Goal**: Admins can update rule properties (path, coil, duration) or toggle their enabled status quickly without deleting.

**Independent Test**: Perform a PUT request on `/api/rules/:id` with new configuration data and verify the change with a subsequent GET request.

### Implementation for User Story 3 & 4

- [ ] T007 [P] [US3] Implement the `update` method in `backend/src/models/rules.js`, handling partial or full field updates.
- [ ] T008 [P] [US3] Implement the PUT `/api/rules/:id` endpoint in `backend/src/api/rules.js`.

**Checkpoint**: Modify operations available. Status toggling operates effortlessly.

---

## Phase 6: User Story 5 - Delete a Rule (Priority: P3)

**Goal**: Admins can delete a rule to remove obsolete configuration elements.

**Independent Test**: Send a DELETE request to `/api/rules/:id` and verify subsequent GET queries no longer display the rule.

### Implementation for User Story 5

- [ ] T009 [P] [US5] Implement the `delete` method in `backend/src/models/rules.js`.
- [ ] T010 [P] [US5] Implement the DELETE `/api/rules/:id` endpoint in `backend/src/api/rules.js`.

**Checkpoint**: Full CRUD available on the API.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T011 Run `quickstart.md` CURL commands to validate end-to-end functionality of all the CRUD endpoints.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: T001 must complete first to initialize the SQLite `rules` table.
- **User Stories (Phase 3+)**: All depend on Phase 2. They should be executed in priority order (P1 -> P2 -> P3 / Phase 3 -> Phase 6).
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Model (`backend/src/models/rules.js`) and API (`backend/src/api/rules.js`) changes within the same user story can often be built simultaneously using stubs / interface mocking before being wired together.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (`rules` table initialization)
2. Complete Phase 3: User Story 1 (POST `/api/rules`)
3. **STOP and VALIDATE**: Verify rule gets saved to SQLite.

### Incremental Delivery
1. Continue down the sequential User Stories to unlock GET, PUT, and DELETE. Validate each independently using `curl` as mapped in `quickstart.md`.
