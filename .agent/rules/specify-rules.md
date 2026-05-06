# plcVisionControl Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-06

## Active Technologies
- Node.js 20+ + `express`, `better-sqlite3` (002-rule-management)
- SQLite (`plc_vision.db` local file) (002-rule-management)
- Node.js 20+ + `chokidar` (external watcher module) (003-file-watcher)
- N/A for raw files (Configuration comes from existing `better-sqlite3` `Rules` model) (003-file-watcher)
- Node.js 20+ + `modbus-serial` (already integrated into Phase 1) (004-plc-execution)
- Transient runtime OS states (Maps for bounding hardware timers) (004-plc-execution)
- Node.js 20+; Next.js 14+ + `next`, `react`. No styling frameworks (Vanilla CSS). (005-gui-control-panel)
- N/A for this phase. (005-gui-control-panel)
- Node.js & React (Next.js) + Next.js App Router, Express, SQLite (007-frontend-config)

- Node.js 20+ + `express` (HTTP API), `better-sqlite3` (Database), `modbus-serial` (PLC Communication) (001-core-infrastructure)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

# Add commands for Node.js 20+

## Code Style

Node.js 20+: Follow standard conventions

## Recent Changes
- 007-frontend-config: Added Node.js & React (Next.js) + Next.js App Router, Express, SQLite
- 006-restart-recovery: Added Node.js 20+ + `modbus-serial`
- 005-gui-control-panel: Added Node.js 20+; Next.js 14+ + `next`, `react`. No styling frameworks (Vanilla CSS).


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
