# Phase 0: Research & Decisions

## Context
Phase 4 bridges logical outputs with pure network transmissions sent via `modbus-serial` TCP interfaces. We need to respect the singular coil limitations requested via the constitution and enforce automatic toggling.

## Decisions

### 1. Coil Queue Pattern
- **Decision**: Coil Indexed Timeout Map (`Map<CoilId, TimeoutObj>`).
- **Rationale**: When `fileTriggered` triggers, we target an index (0-7). We hit the TCP socket with `writeCoil(coil, true)`. We then check if a timer exists in the map for that exact coil. If yes, we clear it. We set a new `setTimeout` utilizing the given duration to run `writeCoil(coil, false)`, then write the timeout reference to the Map.
- **Alternatives considered**: Promise chaining (`await sleep(duration)`). Rejected, since overlapping async waits without interruption references duplicates "OFF" events asynchronously, polluting the timeline.

### 2. Error Resilience
- **Decision**: Passive internal try/catch.
- **Rationale**: `modbus-serial` throws exceptions violently on link breaks. Exposing them kills the container. A `try { writeCoil } catch { console.error }` wrapper natively handles breaks and recovers implicitly without stalling file-engine events in the background.

### 3. Architecture Separation
- **Decision**: Extract queue map logic into `executor.js`.
- **Rationale**: `plc.js` should remain a pure dumb connector housing generic read/write hooks. `executor.js` will act as a brain that maintains business duration logic decoupled from network logic.
