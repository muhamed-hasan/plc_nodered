# API Contracts

## Overview
Internal API for retrieving and updating PLC system settings.

## Endpoints

### GET `/api/settings`
Retrieves the current PLC connection settings.

**Response (200 OK)**:
```json
{
  "plc_ip_address": "192.168.1.100",
  "plc_port": 502
}
```

### POST `/api/settings`
Updates the PLC connection settings and triggers an internal PLC reconnection attempt.

**Request Body**:
```json
{
  "plc_ip_address": "192.168.1.100",
  "plc_port": 502
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Settings updated successfully"
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "Invalid IP address or port provided"
}
```
