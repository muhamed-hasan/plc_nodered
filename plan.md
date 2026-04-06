executive Summary

This project replaces an existing Node-RED-based PLC alarm system with a lightweight, production-ready application. The system monitors file changes and triggers PLC outputs (coils) using configurable rules stored in SQLite.

The primary goal is to maintain the simplicity of the current flow while introducing persistence, configurability, observability, and restart safety.

The system will:

Monitor file paths for any changes
Trigger PLC outputs with configurable durations
Provide a dashboard for configuration, manual control, and logging
Persist all configuration in SQLite
Automatically recover state after restart

The implementation will follow a spec-first approach using spec-kit, broken into small, independent phases. Each phase will produce a working increment of the system.

Project Phases
Phase 1 — Core Infrastructure

Establish the backend foundation and persistence layer.

Scope
Node.js server setup
SQLite integration
Settings storage (PLC IP and port)
Basic API endpoints for settings
PLC connection initialization
Acceptance Criteria
Server starts successfully
Settings can be saved and loaded
PLC connection can be established from saved config
System reconnects after restart
Phase 2 — Rule Management

Introduce configuration for file-to-PLC mappings.

Scope
CRUD operations for rules
Rule fields:
file path
coil (0–7)
duration (ms)
enabled flag
Store rules in SQLite
Basic UI for managing rules
Acceptance Criteria
Rules can be created, edited, deleted
Rules persist after restart
Invalid inputs are handled safely
Phase 3 — File Watcher Engine

Implement file monitoring and event triggering.

Scope
Watch files using chokidar
Trigger on any file change
Apply debounce (≈300ms)
Emit events to logging system
Acceptance Criteria
File change generates a single event
Rapid changes do not produce duplicate triggers
Logs capture file activity
Phase 4 — PLC Execution Engine

Handle actual PLC signal control.

Scope
Write coil ON immediately on trigger
Turn OFF after configured duration
Prevent duplicate timers per coil
Handle retries and errors
Acceptance Criteria
Coil activates within <500ms
Coil deactivates after correct duration
Repeated triggers reset timer instead of stacking
Phase 5 — Manual Control & Diagnostics

Provide operational tools for users.

Scope
Manual ON/OFF control per coil
Test buttons
Real-time system logs
Debug messages for file and PLC events
Acceptance Criteria
Users can manually trigger any coil
Logs reflect all actions in real time
System state is observable
Phase 6 — Restart Recovery & Hardening

Ensure system reliability under real-world conditions.

Scope
Reload configuration from SQLite on startup
Reinitialize watchers automatically
Clean up timers on restart
Handle PLC disconnect/reconnect
Implement log retention policy
Acceptance Criteria
System fully recovers after restart
No manual intervention required
No duplicated watchers or timers
Errors are logged and handled gracefully
Phase 7 — Frontend Configuration Management

Provide a GUI to manage PLC settings and dynamic file-to-outputs mapping.

Scope
Remove `UNIQUE` constraint on `file_path` in SQLite `rules` table, allowing a single file to trigger multiple coils.
Permit comma-separated file paths in a single rule to map multiple files to the same output(s) like Node-RED.
Create a "Settings" UI component to update PLC IP & Port configurations.
Create a "Rules" UI component allowing users to add watched files and link them to one or multiple outputs with custom durations.
Ensure changes push cleanly to the backend APIs (`/api/settings`, `/api/rules`) and re-initialize the active watchers dynamically.
Acceptance Criteria
Users can fully configure the PLC connection from the dashboard.
Users can visually connect a file path (or comma-separated paths) to one or multiple output coils.
GUI perfectly reflects the backend's active state.
System does not require manual API calls via curl to operate.

Implementation Strategy
Each phase is implemented using spec-kit workflow:
specify
clarify
plan
tasks
implement
Each phase must be fully validated before moving to the next
No phase should introduce unnecessary complexity
Key Risks and Mitigations
Risk: File Event Storms
Mitigation: debounce and per-coil timer override
Risk: PLC Communication Failure
Mitigation: retry logic and error logging
Risk: State Loss on Restart
Mitigation: SQLite as single source of truth
Risk: Timer Duplication
Mitigation: one active timer per coil using a map
Success Criteria
System replaces Node-RED flow completely
Stable under rapid file changes
Fully configurable via dashboard
Recovers automatically after restart
Provides clear logging and manual control