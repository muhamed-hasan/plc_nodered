# Data Model: PLC Execution Engine

## Overview
Phase 4 extends runtime state models to encapsulate active network bounds mapped against physical PLC limits. 

## Entities

### `Execution Map` (Runtime Object)
Bounded tightly to native Node Maps, mapping up to 8 max coil definitions per Modbus limitations.

| Key | Type | Value Definition |
|---|---|---|
| `coilId` | INTEGER | Physical mapping (0-7). |
| `timeoutToken` | NodeJS.Timeout | In-memory pointer to the active "OFF" `setTimeout` hook waiting to fire. |

## Modbus Coil Safety Protocol
1. Process payload from `eventBus`.
2. Access `PLCService.writeCoil(coilId, true)` (catch exceptions silently, fallback logging).
3. Check `ExecutionMap.has(coilId)`. If `true`, invoke `clearTimeout` to destroy the pending OFF hook.
4. Construct bounds: `timer = setTimeout(() => { PLCService.writeCoil(coilId, false); ExecutionMap.delete(coilId) }, duration)`.
5. Write: `ExecutionMap.set(coilId, timer)`.
