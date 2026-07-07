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
      plc_port INTEGER NOT NULL,
      plc_unit_id INTEGER NOT NULL DEFAULT 255,
      last_observed_time INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS license (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      key TEXT NOT NULL,
      email TEXT NOT NULL,
      device_id TEXT NOT NULL,
      expire TEXT NOT NULL,
      signature TEXT NOT NULL,
      last_check INTEGER NOT NULL,
      local_signature TEXT
    );
  `);

  const settingsInfo = db.pragma('table_info(settings)');
  const hasUnitId = settingsInfo.some(col => col.name === 'plc_unit_id');
  if (!hasUnitId) {
    db.exec('ALTER TABLE settings ADD COLUMN plc_unit_id INTEGER NOT NULL DEFAULT 255');
  }
  const hasLastObserved = settingsInfo.some(col => col.name === 'last_observed_time');
  if (!hasLastObserved) {
    db.exec('ALTER TABLE settings ADD COLUMN last_observed_time INTEGER DEFAULT 0');
  }

  const licenseInfo = db.pragma('table_info(license)');
  const hasEmail = licenseInfo.some(col => col.name === 'email');
  if (!hasEmail) {
    db.exec("ALTER TABLE license ADD COLUMN email TEXT NOT NULL DEFAULT ''");
  }
  const hasLocalSignature = licenseInfo.some(col => col.name === 'local_signature');
  if (!hasLocalSignature) {
    db.exec("ALTER TABLE license ADD COLUMN local_signature TEXT");
  }

  const tableInfo = db.pragma('table_info(rules)');
  if (tableInfo.length > 0) {
    const tableDef = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='rules'").get();
    if (tableDef && tableDef.sql.includes('UNIQUE')) {
      console.log('Migrating rules table to drop UNIQUE constraint on file_path...');
      db.exec(`
        CREATE TABLE rules_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          file_path TEXT NOT NULL,
          coil INTEGER NOT NULL CHECK (coil >= 0 AND coil <= 7),
          duration INTEGER NOT NULL,
          enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
        );
        INSERT INTO rules_new SELECT * FROM rules;
        DROP TABLE rules;
        ALTER TABLE rules_new RENAME TO rules;
      `);
    }
  } else {
    db.exec(`
      CREATE TABLE rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT NOT NULL,
        coil INTEGER NOT NULL CHECK (coil >= 0 AND coil <= 7),
        duration INTEGER NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1))
      );
    `);
  }
};

initSchema();

module.exports = db;
