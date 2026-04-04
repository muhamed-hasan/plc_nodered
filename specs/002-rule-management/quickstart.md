# Quickstart: Rule Management

## Setup instructions

Phase 2 builds upon the existing Phase 1 server. No new global dependencies are strictly required.

1. **Verify Database Operation**:
   Ensure `plc_vision.db` is writable. The schema initialization logic runs automatically when the updated `backend/src/models/db.js` file is loaded on startup.

2. **Run the server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify API Endpoints**:
   - Create a Rule:
     ```bash
     curl -X POST http://localhost:3001/api/rules -H "Content-Type: application/json" -d '{"file_path": "/tmp/test.csv", "coil": 2, "duration": 350}'
     ```
   - List Rules:
     ```bash
     curl -X GET http://localhost:3001/api/rules
     ```
   - Disable Rule (Assuming ID 1 was created):
     ```bash
     curl -X PUT http://localhost:3001/api/rules/1 -H "Content-Type: application/json" -d '{"enabled": 0}'
     ```
   - Delete Rule:
     ```bash
     curl -X DELETE http://localhost:3001/api/rules/1
     ```
