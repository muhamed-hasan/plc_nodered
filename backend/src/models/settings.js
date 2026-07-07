const db = require('./db');

class Settings {
  static get() {
    try {
      const row = db.prepare('SELECT plc_ip_address, plc_port, plc_unit_id, last_observed_time FROM settings WHERE id = 1').get();
      return row || null;
    } catch (e) {
      console.error('Error fetching settings from DB:', e.message);
      return null;
    }
  }

  static update({ plc_ip_address, plc_port, plc_unit_id = 255 }) {
    const existing = db.prepare('SELECT id FROM settings WHERE id = 1').get();
    if (existing) {
      db.prepare('UPDATE settings SET plc_ip_address = ?, plc_port = ?, plc_unit_id = ? WHERE id = 1')
        .run(plc_ip_address, plc_port, plc_unit_id);
    } else {
      db.prepare('INSERT INTO settings (id, plc_ip_address, plc_port, plc_unit_id) VALUES (1, ?, ?, ?)')
        .run(plc_ip_address, plc_port, plc_unit_id);
    }
    return this.get();
  }

  static updateLastObservedTime(timestamp) {
    const existing = db.prepare('SELECT id FROM settings WHERE id = 1').get();
    if (existing) {
      db.prepare('UPDATE settings SET last_observed_time = ? WHERE id = 1').run(timestamp);
    } else {
      // If no settings exist yet, insert a placeholder record with the timestamp using single quotes for empty string
      db.prepare("INSERT INTO settings (id, plc_ip_address, plc_port, plc_unit_id, last_observed_time) VALUES (1, '', 502, 255, ?)")
        .run(timestamp);
    }
  }
}

module.exports = Settings;
