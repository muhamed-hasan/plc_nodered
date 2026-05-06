# Phase 0: Research & Decisions

## Context
This phase establishes the backend foundation for plcVisionControl. The system requires an HTTP API, persistent configuration storage, and PLC communication.

## Decisions

### 1. HTTP API Framework
- **Decision**: Express (`express`)
- **Rationale**: Express is the industry standard for lightweight Node.js APIs. It provides a simple, well-documented interface for creating endpoints without the overhead of larger frameworks like NestJS.
- **Alternatives considered**: Fastify (too complex for our minimal needs), native `http` module (too much boilerplate for routing).

### 2. SQLite Integration
- **Decision**: `better-sqlite3`
- **Rationale**: Provides synchronous, fast database access operations. For a local, internal, single-PLC application, synchronous DB access eliminates the complexity of async wrappers and promises, allowing for more deterministic code execution within a single thread.
- **Alternatives considered**: `sqlite3` (asynchronous, older), Prisma or TypeORM (too heavy for a single settings table).

### 3. PLC Communication
- **Decision**: `modbus-serial`
- **Rationale**: A reliable, widely used pure JavaScript library for Modbus communication in Node.js. It natively supports Modbus TCP.
- **Alternatives considered**: None. It is the de-facto standard for Modbus in Node.js.
