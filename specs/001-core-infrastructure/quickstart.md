# Quickstart: Core Infrastructure

## Prerequisites
- Node.js 20+
- npm or yarn

## Setup instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install express better-sqlite3 modbus-serial cors
   ```

2. **Initialize Database:**
   The SQLite database (`plc_vision.db`) will be automatically created on startup using our db initializer models.

3. **Run the server:**
   ```bash
   node src/index.js
   ```
   *(Hot-reloading with `nodemon` or `node --watch` will be added in development tasks)*

4. **Verify operations:**
   - The server should log successful startup and database initialization.
   - If no PLC is configured, it will log a warning or standard error waiting for config.
   - Use `curl` to send a POST request to `/api/settings` to configure your PLC details.
