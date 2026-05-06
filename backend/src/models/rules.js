const db = require('./db');

class Rules {
  static create({ file_path, coil, duration, enabled = 1 }) {
    const result = db.prepare(`
      INSERT INTO rules (file_path, coil, duration, enabled) 
      VALUES (?, ?, ?, ?)
    `).run(file_path, coil, duration, enabled);
    
    return db.prepare('SELECT * FROM rules WHERE id = ?').get(result.lastInsertRowid);
  }

  static getAll() {
    return db.prepare('SELECT * FROM rules ORDER BY id ASC').all();
  }

  static update(id, updates) {
    const existing = db.prepare('SELECT * FROM rules WHERE id = ?').get(id);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    
    db.prepare(`
      UPDATE rules 
      SET file_path = ?, coil = ?, duration = ?, enabled = ?
      WHERE id = ?
    `).run(merged.file_path, merged.coil, merged.duration, merged.enabled, id);

    return db.prepare('SELECT * FROM rules WHERE id = ?').get(id);
  }

  static delete(id) {
    const result = db.prepare('DELETE FROM rules WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

module.exports = Rules;
