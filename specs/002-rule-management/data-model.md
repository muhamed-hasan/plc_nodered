# Data Model: Rule Management

## Overview
Phase 2 manages the file-to-PLC trigger rules, persisting them in the local SQLite instance established in Phase 1.

## Entities

### `rules`
A table storing multiple file-to-PLC triggers.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique ID for the rule. |
| `file_path` | TEXT | UNIQUE, NOT NULL | The absolute or relative path to monitor. Prevents duplicate watches. |
| `coil` | INTEGER | NOT NULL, CHECK (coil >= 0 AND coil <= 7) | The PLC coil index. Constrained 0-7. |
| `duration` | INTEGER | NOT NULL | Duration in ms to activate the coil. |
| `enabled` | INTEGER | NOT NULL DEFAULT 1, CHECK (enabled IN (0, 1)) | Boolean state representing if rule is active. |

### Validation Rules
- `file_path`: Cannot be null or empty. Must be unique.
- `coil`: Must be an integer between 0 and 7.
- `duration`: Must be an integer > 0.
- `enabled`: Must be 0 (false) or 1 (true).

## State Transitions
- **Create**: Inserts row with inputs, assigns auto-increment ID.
- **Update**: Modifies fields by ID.
- **Toggle**: Flips `enabled` bit by ID.
- **Delete**: Drops row by ID.
