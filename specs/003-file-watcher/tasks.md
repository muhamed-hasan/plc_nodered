---
description: "Task list for Phase 3: File Watcher Engine implementation"
---

# Tasks: File Watcher Engine

**Input**: Design documents from `/specs/003-file-watcher/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Install `chokidar` package as a normal dependency within `backend/package.json`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T002 Create a native Node.js `EventEmitter` singleton export in `backend/src/services/eventBus.js`.

**Checkpoint**: Foundation ready - decoupled event channel established.

---

## Phase 3: User Story 1 - File Monitoring and Change Detection (Priority: P1) 🎯 MVP

**Goal**: As an automated process acting on behalf of the operations team, I want the system to continuously monitor specified file paths for changes.

**Independent Test**: Modifying the watched file path triggers raw detection console outputs natively on the server.

### Implementation for User Story 1

- [ ] T003 [US1] Create the core `WatcherService` in `backend/src/services/watcher.js`. It must fetch `enabled = 1` rules from SQLite (`Rules` model) on boot and feed them into `chokidar.watch()`, tracking `add` and `change` events.
- [ ] T004 [US1] Import and initialize the `WatcherService` at the bottom of `backend/src/index.js` during server startup.

**Checkpoint**: At this point, the node process successfully binds directly to target OS files and logs noisy outputs freely upon external writes.

---

## Phase 4: User Story 2 - Trigger Debouncing (Priority: P1)

**Goal**: Group rapid successive file writes into a strict 300ms single event buffer.

**Independent Test**: Modifying the file 10 times manually within milliseconds will yield exactly one resolved log after 300ms.

### Implementation for User Story 2

- [ ] T005 [P] [US2] Inside `backend/src/services/watcher.js`, introduce a `Map()` to store active timeout handles keyed by `file_path`. Upon `chokidar` input, clear previously existing handles for a file and set a 300ms `setTimeout()` before proceeding.

**Checkpoint**: Event storms are accurately swallowed natively by Node.

---

## Phase 5: User Story 3 - Event Logging Emission (Priority: P2)

**Goal**: Fire an encapsulated logical event into the system stream accompanied by accurate application-level audit logging.

**Independent Test**: The system will explicitly format the terminal logging denoting a "Watch Event", and the isolated EventEmitter actively receives payload blocks.

### Implementation for User Story 3

- [ ] T006 [P] [US3] Inside the resolution block of `backend/src/services/watcher.js`, emit a `fileTriggered` event directly to `eventBus.js` including the path, mapped coil, duration, and timestamp.
- [ ] T007 [P] [US3] Implement a structured `console.log` immediately after the emit identifying the file path and target coil execution.

**Checkpoint**: Engine logic is sealed and ready for Phase 4 to construct the Modbus PLC mappings!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T008 Run the rapid-fire bash hook documented in `quickstart.md` (`for i in {1..10}...`) to manually prove the debounce successfully silences 9 of the 10 writes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: N/A
- **Foundational (Phase 2)**: Depends on T001.
- **User Stories (Phase 3+)**: Must be executed chronologically as the file watcher starts naked and iterates sequentially through debouncing logic (T005 modifies T003 outputs).
- **Polish (Final Phase)**: Depends on all user stories completing properly.

### Parallel Opportunities

- Due to the nature of a single logical node service file (`watcher.js`), most file system monitoring logic runs strictly chronologically. However, `T006` and `T007` represent simple functional parallel appends logic within the buffer block.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2.
2. Complete Phase 3: User Story 1 (Raw File Binding).
3. **STOP and VALIDATE**: Output `echo ""` onto tracked configs mapped in your SQLite config database. Observe arbitrary server noises.

### Incremental Delivery
1. Rollout Phase 4 (US2). Notice noise drops to solitary timer blocks.
2. Complete Phase 5 (US3). Verify log shapes match strict runtime expectations documented previously.
