const db = require('./db');

class Settings {
  static get() {
    const row = db.prepare('SELECT plc_ip_address, plc_port FROM settings WHERE id = 1').get();
    return row || null;
  }

  static update({ plc_ip_address, plc_port }) {
    const existing = db.prepare('SELECT id FROM settings WHERE id = 1').get();
    if (existing) {
      db.prepare('UPDATE settings SET plc_ip_address = ?, plc_port = ? WHERE id = 1')
        .run(plc_ip_address, plc_port);
    } else {
      db.prepare('INSERT INTO settings (id, plc_ip_address, plc_port) VALUES (1, ?, ?)')
        .run(plc_ip_address, plc_port);
    }
    return this.get();
  }
}

module.exports = Settings;
