const db = require('./db');

class Settings {
  static get() {
    const row = db.prepare('SELECT plc_ip_address, plc_port, plc_unit_id FROM settings WHERE id = 1').get();
    return row || null;
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
}

module.exports = Settings;
