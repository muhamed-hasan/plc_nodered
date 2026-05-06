# Data Model: Phase 7

## Table: rules (Version 2)
```sql
    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT NOT NULL,
      coil INTEGER NOT NULL CHECK (coil >= 0 AND coil <= 7),
      duration INTEGER NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
    );
```
**Changes relative to Phase 1:** `UNIQUE` constraint has been permanently removed structurally smoothly.
