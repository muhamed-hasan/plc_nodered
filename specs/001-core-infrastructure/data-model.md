# Data Model: Core Infrastructure

## Overview
Phase 1 persists global system configuration in a local SQLite database.

## Entities

### `settings`
A single-row configuration table storing the active PLC connection configuration.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Hardcoded to `1` (ensures single row) |
| `plc_ip_address` | TEXT | NOT NULL | The IPv4 address of the Modbus TCP PLC |
| `plc_port` | INTEGER | NOT NULL | The port used for Modbus TCP (default 502) |

### Validation Rules
- `plc_ip_address`: Must be a valid IPv4 address string (e.g., `192.168.1.100`).
- `plc_port`: Must be a valid port number between `1` and `65535`.

## State Transitions
Not applicable for this entity as it is a pure configuration store.
