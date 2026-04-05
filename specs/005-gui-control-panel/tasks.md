---
description: "Task list for Phase 5: GUI Control Panel implementation"
---

# Tasks: GUI Control Panel

**Input**: Design documents from `/specs/005-gui-control-panel/`
**Prerequisites**: plan.md, spec.md, research.md, contracts/api.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize the baseline Next.js structure inside a new `frontend/` directory via `npx -y create-next-app@latest ./frontend --javascript --eslint --app --src-dir --no-tailwind --import-alias "@/*"` non-interactively configuring Vanilla DOM targets as per the constitution rules.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Modify `frontend/next.config.mjs` to establish an internal REST proxy mapping `rewrites() { return [{ source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' }]}` bypassing cross-origin restrictions cleanly against the local system context.

**Checkpoint**: Foundation ready - UI elements can freely pipe backend payloads.

---

## Phase 3: User Story 1 - Manual Coil Control Interface (Priority: P1) 🎯 MVP

**Goal**: As an operations manager, I want an interface to manually toggle specific physical output coils (ON or OFF) directly bypassing the automated file watcher logic.

**Independent Test**: Clicking the override button cleanly transmits the boolean state directly to the targeted physical Modbus output via the proxy bypass endpoints seamlessly.

### Implementation for User Story 1

- [x] T003 [P] [US1] Build the control endpoint internally at `backend/src/api/manual.js` exposing `POST /coil/:id`. Parse JSON `req.body.state` mapped to trigger native Modbus boolean pushes (via `PLCService`).
- [x] T004 [US1] Bind the manual router via `app.use('/api/manual', manualRouter)` cleanly inside the `backend/src/app.js` stack.
- [x] T005 [P] [US1] Build the client component `frontend/src/components/CoilControl.js` looping an 8-item array presenting clean boolean Override Toggle buttons posting directly explicitly mapped to `/api/manual/coil/:index`.
- [x] T006 [US1] Render `<CoilControl />` centrally onto `frontend/src/app/page.js` establishing the standard interactive GUI structure.

**Checkpoint**: At this point, the node process manually controls the coil relays flawlessly directly skipping background monitoring timelines.

---

## Phase 4: User Story 2 - System Activity Traceability (Priority: P1)

**Goal**: Troubleshoot broken execution chains natively checking a live hardware diagnostic monitor locally without hitting CLI terminals constantly.

**Independent Test**: Background hardware logging dynamically floats natively onto frontend UI components via `text/event-stream` channels automatically formatting without requiring an unneeded page refresh.

### Implementation for User Story 2

- [x] T007 [P] [US2] Inject localized background logging `.emit('log', { timestamp, type, message })` endpoints actively into existing structural hooks (`watcher.js` inside resolving triggers, and `executor.js` alongside explicit ON/OFF boolean checks) explicitly pushing string diagnostics onto the native `eventBus` pipeline.
- [x] T008 [US2] Deploy the log streaming route establishing `backend/src/api/logs.js` (`GET /stream`). Format headers structurally declaring headers `Content-Type: text/event-stream`. Pass logical background objects (`eventBus.on("log")`) directly through the connection iteratively.
- [x] T009 [US2] Bind the logs router via `app.use('/api/logs', logsRouter)` cleanly inside the `backend/src/app.js` stack.
- [x] T010 [P] [US2] Implement `<LogTerminal />` structurally into `frontend/src/components/LogTerminal.js` mapping standard Web API calls `new EventSource('/api/logs/stream')` listening continuously on the active background message string appending text directly into a scrollable bounding component box context internally.
- [x] T011 [US2] Inject the active streaming `<LogTerminal />` widget prominently into `frontend/src/app/page.js`.

**Checkpoint**: Diagnostic transparency completes safely rendering exact log output traces universally.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T012 Spin up the global framework environments simultaneously tracking `npm run dev` in both explicit workspace sub-directories confirming native frontend visual bindings manually hitting file targets correctly locally utilizing `quickstart.md` assumptions natively mapped to user outputs perfectly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: Core GUI scaffolding requirements.
- **User Stories (Phase 3+)**: US1 safely constructs the interactive UI parameters. US2 seamlessly bolts tracking tools concurrently.
- **Polish (Final Phase)**: Checks real-world execution.

### Parallel Opportunities

- T003 & T005: Backend API route and Frontend React Component can be completely separated.
- T007 & T010: Backend event extraction and frontend event rendering layout can be split correctly.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Provision the Next.js scaffold. Connect the proxy routing parameters cleanly internally.
2. Form the pure `/api/manual` POST route checking basic PLCService interactions natively resolving simple boolean pushes.

### Incremental Delivery
1. Target US2 providing exact timeline boundaries and active queue monitoring logs rendering back automatically onto the screen explicitly displaying active Modbus hardware limits structurally mirroring real-time processing seamlessly.
