# Phase 0: Research & Decisions

## Context
Phase 2 builds CRUD capabilities on top of the Phase 1 Foundation. We need to evaluate the best way to handle SQLite table updates without migrations logic yet, and coordinate API routes cleanly.

## Decisions

### 1. SQLite Table Migrations
- **Decision**: Update `backend/src/models/db.js` using raw SQL `CREATE TABLE IF NOT EXISTS` alongside Phase 1.
- **Rationale**: Since the database is a simple configuration data layer without extreme multi-relational complexities, maintaining a single synchronous `initSchema()` method that creates tables if they don't exist is perfectly deterministic and restart-safe.
- **Alternatives considered**: An explicit migrations system via `knex` or similar. Deemed overly complex and violating the "Minimal Dependencies" Constitution principle.

### 2. Validation Pattern
- **Decision**: In-route vanilla express body checks.
- **Rationale**: The input schema is extremely narrow (path, coil integer, duration integer, enabled boolean). Pulling in heavyweight libraries like `Joi` or `Zod` is unnecessary overhead at this stage.
- **Alternatives considered**: Yup, Zod, Joi. Overkill.
