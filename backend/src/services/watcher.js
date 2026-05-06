const chokidar = require('chokidar');
const Rules = require('../models/rules');
const eventBus = require('./eventBus');

class WatcherService {
  constructor() {
    this.watcher = null;
    this.rulesList = [];
    this.debounceTimers = new Map();
  }

  init() {
    this.rulesList = Rules.getAll().filter(r => r.enabled === 1);
    const paths = this.rulesList.map(r => r.file_path);
    
    this.watcher = chokidar.watch(paths, { persistent: true });

    this.watcher.on('add', (path) => this.handleRawEvent(path, 'add'));
    this.watcher.on('change', (path) => this.handleRawEvent(path, 'change'));
    
    console.log(`Watcher initialized for ${paths.length} enabled paths.`);
  }

  handleRawEvent(path, eventType) {
    if (this.debounceTimers.has(path)) {
      clearTimeout(this.debounceTimers.get(path));
    }

    const timer = setTimeout(() => {
      this.debounceTimers.delete(path);
      this.resolveEvent(path);
    }, 300);

    this.debounceTimers.set(path, timer);
  }

  resolveEvent(path) {
    const rule = this.rulesList.find(r => r.file_path === path);
    if (!rule) return;

    const eventPayload = {
      rule_id: rule.id,
      file_path: rule.file_path,
      coil: rule.coil,
      duration: rule.duration,
      timestamp: Date.now()
    };

    eventBus.emit('fileTriggered', eventPayload);
    const msg = `[Watch Event] Path: ${path} | Target Coil: ${rule.coil} | Duration: ${rule.duration}ms`;
    console.log(`${msg} | Timestamp: ${eventPayload.timestamp}`);
    eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
  }
}

module.exports = new WatcherService();
