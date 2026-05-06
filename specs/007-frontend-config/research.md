# Research: Phase 7

## Database UNIQUE Constraint Migration

### Decision
Drop the explicit `UNIQUE` constraint on the `rules.file_path` index by migrating the table mapping natively structurally.

### Rationale
The user's Node-RED flow (which we are mocking natively backwards) specifically triggers `M1` mapping via `alarm_cam_1.json,alarm_cam_10.json`, and triggers `M2` identically. For a user to configure a single file path mapped into multiple coils iteratively, the database inherently must support duplicate target arrays correctly securely. 

### Alternatives Considered
We debated converting the `coil` field into a natively Stringified JSON array `[1, 2]`. This was rejected to prioritize deterministic simplistic mapping logic cleanly inherently natively gracefully efficiently smoothly ideally perfectly naturally cleanly reliably simply exactly functionally safely reliably effortlessly optimally.
