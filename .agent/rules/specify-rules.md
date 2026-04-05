# plcVisionControl Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-05

## Active Technologies
- Node.js 20+ + `express`, `better-sqlite3` (002-rule-management)
- SQLite (`plc_vision.db` local file) (002-rule-management)
- Node.js 20+ + `chokidar` (external watcher module) (003-file-watcher)
- N/A for raw files (Configuration comes from existing `better-sqlite3` `Rules` model) (003-file-watcher)

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
- 003-file-watcher: Added Node.js 20+ + `chokidar` (external watcher module)
- 002-rule-management: Added Node.js 20+ + `express`, `better-sqlite3`

- 001-core-infrastructure: Added Node.js 20+ + `express` (HTTP API), `better-sqlite3` (Database), `modbus-serial` (PLC Communication)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
