const db = require('./db');

class License {
  static get() {
    try {
      const row = db.prepare('SELECT key, email, device_id, expire, signature, last_check FROM license WHERE id = 1').get();
      return row || null;
    } catch (e) {
      console.error('Error fetching license from DB:', e.message);
      return null;
    }
  }

  static set({ key, email, device_id, expire, signature, last_check }) {
    db.transaction(() => {
      db.prepare('DELETE FROM license').run();
      db.prepare('INSERT INTO license (id, key, email, device_id, expire, signature, last_check) VALUES (1, ?, ?, ?, ?, ?, ?)')
        .run(key, email, device_id, expire, signature, last_check);
    })();
    return this.get();
  }

  static clear() {
    db.prepare('DELETE FROM license').run();
  }
}

module.exports = License;
