const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../../plc_vision.db');
const db = new Database(dbPath, { verbose: console.log });

// Initialize schema
db.pragma('journal_mode = WAL');

const initSchema = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      plc_ip_address TEXT NOT NULL,
      plc_port INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file_path TEXT UNIQUE NOT NULL,
      coil INTEGER NOT NULL CHECK (coil >= 0 AND coil <= 7),
      duration INTEGER NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
    );
  `);
};

initSchema();

module.exports = db;
