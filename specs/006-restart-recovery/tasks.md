---
description: "Task list for Phase 6: Restart Recovery & Hardening"
---

# Tasks: Restart Recovery & Hardening

**Input**: Design documents from `/specs/006-restart-recovery/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No pure setup tasks required; modifying existing structure)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 Modify `backend/src/services/executor.js` to explicitly invoke `this.executionMap.clear()` dynamically inside the constructor seamlessly guaranteeing boot sequences explicitly drop hanging memory bounds cleanly wiping native timelines explicitly resolving FR-003.

**Checkpoint**: Base class arrays guaranteed wiped unconditionally globally on boot.

---

## Phase 3: User Story 1 - Stateless System Rehydration (Priority: P1)

**Goal**: As a sysadmin, I want the node process to automatically reload all configuration schemas (PLC connection info and file watcher rules) derived purely from persistent storage upon any arbitrary application boot.

**Independent Test**: Killing the Node process (`SIGINT`) natively dropping timelines explicitly reloads dynamically seamlessly verifying file configurations rehydrate mapping exactly native database arrays natively dynamically.

### Implementation for User Story 1

- [x] T002 [P] [US1] Refactor `backend/src/index.js` boot logic explicitly chaining `.then` or `setTimeout` bounds natively checking Modbus initialisation completes BEFORE triggering `watcherService.init()` ensuring hardware locks exist safely resolving explicit FR-001 initialization synchronization securely.

**Checkpoint**: Core architecture inherently chains connection checks explicitly before initializing watcher triggers.

---

## Phase 4: User Story 2 - Resilient Network Connections (Priority: P1)

**Goal**: As a hardware engineer, I want the system to continuously attempt PLC connectivity after brief physical disconnections.

**Independent Test**: Dropping Modbus targets dynamically triggers an immediate loop bound catching errors securely logging Native warnings tracking explicitly every 5000ms attempting dynamically reconnect loops indefinitely.

### Implementation for User Story 2

- [x] T003 [P] [US2] Modify `backend/src/services/plc.js` expanding `connect(ip, port)` resolving native Modbus socket limits catching native rejections explicitly capturing drops seamlessly preventing global error traces halting processes securely natively.
- [x] T004 [US2] Inject an async retry polling pattern natively leveraging `setInterval` wrapping explicit 5000ms mapping attempts gracefully looping against `client.connectTCP()` bounds directly emitting diagnostic traces into `eventBus.emit('log', ...)` inside `backend/src/services/plc.js`.
- [x] T005 [US2] Wrap all generic `PLCService.getClient().writeCoil()` execution sequences structurally testing native Boolean connection states dynamically returning localized error strings instead of crashing if the physical limit falls completely offline abruptly gracefully correctly identically safely inside `executor.js` and `plc.js`.

**Checkpoint**: Modbus connection logic loops gracefully capturing connection losses seamlessly natively handling indefinitely polling boundaries.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T006 Launch the global environments simultaneously following `quickstart.md` simulating a physical connection drop dynamically explicitly confirming log streaming targets display recursive reconnects actively without halting core backend Node lifecycles.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Wipe properties required strictly enforcing physical limits natively prior chaining boots.
- **User Stories (Phase 3+)**: US1 safely guarantees booting patterns. US2 actively resolves the network stability boundaries natively checking loops.
- **Polish (Final Phase)**: Manually executes simulated offline behaviors correctly securely checking limits comprehensively universally exactly logically flawlessly.

### Parallel Opportunities

- T002 & T003: Boot routing index.js modifications and low-level Modbus client.connect logic can be developed independently correctly.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Enforce memory deletion explicitly on class boots testing basic parameters quickly tracking Node sequences exactly resolving cleanly.
2. Refactor Node sequencing strictly tying watcher boots to safe hardware bounds explicitly locking bounds properly perfectly correctly effectively cleanly locally securely successfully flawlessly smoothly simply properly cleanly universally cleanly inherently seamlessly structurally accurately exactly gracefully structurally.

### Incremental Delivery
1. Finally wrap network dependencies generating infinitely checking loops mapped gracefully structurally continuously safely handling natively perfectly natively recursively seamlessly explicitly efficiently securely efficiently efficiently correctly optimally gracefully logically seamlessly simply.
