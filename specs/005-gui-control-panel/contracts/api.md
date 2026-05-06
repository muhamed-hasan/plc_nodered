# Interface Contracts: Phase 5 GUI Endpoints

## 1. Manual Coil Override Endpoint
- **Method**: POST `/api/manual/coil/:id`
- **Body**: `{ "state": boolean }`
- **Description**: Triggers `PLCService.writeCoil(id, state)` avoiding the ExecutionQueue Map limits gracefully.

## 2. Server-Sent Events Stream
- **Method**: GET `/api/logs/stream`
- **Description**: Exposes `text/event-stream` returning `{ timestamp, type, message }` JSON blocks indefinitely.
