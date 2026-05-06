---
description: "Task list for Phase 4: PLC Execution Engine implementation"
---

# Tasks: PLC Execution Engine

**Input**: Design documents from `/specs/004-plc-execution/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- There are no new external dependencies or database setups needed for this phase.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Create the core `ExecutorService` singleton export in `backend/src/services/executor.js`. Wire it into the main lifecycle by requiring it at the bottom of `backend/src/index.js`.

**Checkpoint**: Foundation ready - the central router file binds the executor class asynchronously upon server boot.

---

## Phase 3: User Story 1 - Instantaneous Automation Signaling (Priority: P1) 🎯 MVP

**Goal**: As an industrial machine operator, I want the system to immediately activate physical machinery (via a PLC coil) the moment a valid, debounced file event resolves.

**Independent Test**: Forcing a `fileTriggered` event natively passes an exact Modbus TCP "ON/write(1)" signal out via the injected PLC instance instantly.

### Implementation for User Story 1

- [x] T002 [US1] Inside `backend/src/services/executor.js`, import `eventBus` and `PLCService` (from `backend/src/services/plc.js`). Attach a listener onto `eventBus.on('fileTriggered')`. Parse the payload and fire `PLCService.writeCoil(coil, true)`. Wrap this cleanly in a try/catch logging block preventing network unreachability from fatally breaking the event queue.

**Checkpoint**: At this point, the node process successfully maps internal events into physical PLC outputs unilaterally!

---

## Phase 4: User Story 2 - Automated Hardware Reset (Priority: P1)

**Goal**: Turn the PLC coil definitively OFF after its configured rule duration expires natively within the new host system.

**Independent Test**: Timing the coil response via an inspector witnesses exactly *X* milliseconds bounding the ON to the generic OFF swap.

### Implementation for User Story 2

- [x] T003 [US2] Inside `backend/src/services/executor.js`, construct an internal native mapping (`this.executionMap = new Map()`). Add a `setTimeout` bounded by the `duration` parameter pulled from the trigger payload directly below your `true` network transmission. Once the timeout completes, run `PLCService.writeCoil(coil, false)` and cleanly delete the key from the map.

**Checkpoint**: Output arrays autonomously reset to defaults bounding physical loops cleanly.

---

## Phase 5: User Story 3 - Rapid Fire Signal Override (Priority: P2)

**Goal**: Allow rapid continuous triggers targeting the *same* active coil to reset the existing countdown rather than firing duplicate commands.

**Independent Test**: Emitting the identical coil target twice sequentially limits TCP packets to 1 invocation of ON, and exactly 1 delayed resolution of OFF.

### Implementation for User Story 3

- [x] T004 [US3] Inside `backend/src/services/executor.js`'s event listener execution path, inject a conditional check measuring if `this.executionMap.has(coil)` is true. If it holds an active timer, dynamically hit `clearTimeout(this.executionMap.get(coil))` prior to invoking the new `setTimeout` block. Filter the redundant `PLCService.writeCoil(coil, true)` firing using this boolean.

**Checkpoint**: Network throughput limits are completely immune to overlap spam logic natively bounding physical switches gracefully constraints!

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T005 Run the loop integration test against `/tmp/test.csv` provided via `quickstart.md` observing overlapping internal resets protecting the Modbus driver automatically.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Core logic hook instantiation.
- **User Stories (Phase 3+)**: Executes sequentially since the internal timeline dictates `ON` (T002), then `OFF` bounds (T003), followed tightly by duplicate filter checks (T004).
- **Polish (Final Phase)**: Validates exactly the sequential stack integration.

### Parallel Opportunities

None at this scope as `executor.js` manages identical map states sequentially via class mutations iteratively.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Boot T001 and T002 natively.
2. Trigger the OS file edit. Witness the PLC Service report a blind physical "true" array push.

### Incremental Delivery
1. Implement Phase 4 (US2) enabling automated shutdown logic. Monitor logs returning boolean tracking updates automatically.
2. Implement Phase 5 (US3) safely restricting duplications and closing out the architectural intent.
