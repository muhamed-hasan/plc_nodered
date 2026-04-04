# API Contracts: Rule Management

## Overview
Internal API endpoints for managing file-to-PLC trigger rules.

## Endpoints

### GET `/api/rules`
Retrieves a list of all configured rules.

**Response (200 OK)**:
```json
[
  {
    "id": 1,
    "file_path": "/var/log/sensor_a.csv",
    "coil": 0,
    "duration": 500,
    "enabled": 1
  }
]
```

### POST `/api/rules`
Creates a new rule mapping.

**Request Body**:
```json
{
  "file_path": "/var/log/sensor_b.csv",
  "coil": 1,
  "duration": 1000
}
```
*(Note: `enabled` defaults to true/1 on creation if omitted, though explicit pass is allowed).*

**Response (201 Created)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "file_path": "/var/log/sensor_b.csv",
    "coil": 1,
    "duration": 1000,
    "enabled": 1
  }
}
```

**Response (400 Bad Request)**:
```json
{
  "error": "File path already exists in another rule."
}
```

### PUT `/api/rules/:id`
Updates an existing rule perfectly overriding the provided fields.

**Request Body**:
```json
{
  "duration": 1500,
  "enabled": 0
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": 2,
    "file_path": "/var/log/sensor_b.csv",
    "coil": 1,
    "duration": 1500,
    "enabled": 0
  }
}
```

**Response (404 Not Found)**:
```json
{
  "error": "Rule not found."
}
```

### DELETE `/api/rules/:id`
Permanently deletes a rule.

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Rule 2 deleted."
}
```
