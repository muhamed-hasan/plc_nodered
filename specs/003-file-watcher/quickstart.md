# Quickstart: File Watcher Engine

## Setup instructions

Phase 3 introduces `chokidar` as an external dependency which needs to be installed in the backend package.

1. **Install Dependencies**:
   ```bash
   cd backend
   npm install chokidar
   ```

2. **Run the server**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Verify File Watcher**:
   - Ensure you have a rule created from Phase 2 that watches a `/tmp/` file. (Refer to the Phase 2 Quickstart CURL POST payload if needed).
   - In another terminal, trigger a rapid series of file creations/modifications on the target file path:
     ```bash
     for i in {1..10}; do echo "change $i" >> /tmp/test.csv; sleep 0.05; done
     ```
   - In your `npm run dev` console log, you should see exactly **ONE** file triggered log entry containing the mapped coil and duration properties around 300ms after the loop finishes executing!
