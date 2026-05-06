# Data Model: File Watcher Engine

## Overview
Phase 3 builds on the `Rules` entity from Phase 2 but introduces a conceptual runtime state model for events rather than a persistent database schema model.

## Entities

### `Watch Event` (Runtime Object)
This is not a persisted database table, but the internal logical object emitted over the Node `EventEmitter`.

| Field | Type | Description |
|---|---|---|
| `rule_id` | INTEGER | The ID from the `rules` table that matched this trigger. |
| `file_path` | TEXT | The absolute path that was actively modified. |
| `coil` | INTEGER | The target coil to hit (passthrough from Rules). |
| `duration` | INTEGER | The duration metric (passthrough from Rules). |
| `timestamp` | NUMBER | Node `Date.now()` marker when the final debounce completed. |

## Inter-System State Machine
1. File OS Event (`add`, `change`) detected by `chokidar`.
2. Path map checked: Is there a timeout already running for this path?
   - Yes: Clear old timeout, start new 300ms timeout window.
   - No: Start new 300ms timeout window.
3. Timeout Execution: Assemble `Watch Event` payload based on the matching `Rules` dictionary reference and emit via `eventBus.emit('fileTriggered', eventPayload)`.
4. Console Logger catches the event and prints its outcome natively.
