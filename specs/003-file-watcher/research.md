# Phase 0: Research & Decisions

## Context
Phase 3 requires actively monitoring the filesystem using Node.js for changes based on our internal SQLite rules dictionary. A primary constraint is avoiding duplicating node event dispatches during multi-part file writes, necessitating a debounce buffer logic before emitting to the log stream.

## Decisions

### 1. Watcher Library
- **Decision**: Use `chokidar`.
- **Rationale**: While `fs.watch` is built-in, it fundamentally struggles on Linux implementations regarding reliability, recursion, and unified cross-write events. `chokidar` inherently smooths over `INOTIFY` differences and gracefully ignores many editor lock file swaps.
- **Alternatives considered**: Raw native `fs.watch`. Rejected due to unstable Linux file lock characteristics requiring vast boilerplating.

### 2. Debounce Architecture
- **Decision**: Key-based timer debounce (300ms).
- **Rationale**: When a file triggers an `add` or `change` event, a `clearTimeout` / `setTimeout` block mapping strictly to that file's hash or absolute path runs. Once that singular path timeout resolves without further interruption, exactly 1 logical emit fires.
- **Alternatives considered**: Lodash `_.debounce`. Rejected (we want minimal dependencies, map-based timeouts use pure native JS limits easily). 

### 3. IPC / Decoupling Strategy
- **Decision**: Native Node.js `EventEmitter`.
- **Rationale**: Phase 3 outputs logic that Phase 4 needs to execute against. Utilizing a lightweight exported native `eventBus` prevents tight coupling where the file watcher directly invokes PLC hooks.
- **Alternatives considered**: Redis PubSub, external event channels. Violates minimum requirements dependencies constraint.
