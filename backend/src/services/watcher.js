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
    const LicenseManager = require('./licenseManager');
    const licenseStatus = LicenseManager.getStatus();

    if (licenseStatus.status !== 'active') {
      console.warn('[Watcher] License is not active. Rules file watching is disabled.');
      this.rulesList = [];
    } else {
      this.rulesList = Rules.getAll().filter(r => r.enabled === 1);
    }

    const paths = Array.from(new Set(
      this.rulesList.flatMap(r => r.file_path.split(',').map(p => p.trim()))
    ));
    
    if (paths.length > 0) {
      this.watcher = chokidar.watch(paths, { persistent: true });
      this.watcher.on('add', (path) => this.handleRawEvent(path, 'add'));
      this.watcher.on('change', (path) => this.handleRawEvent(path, 'change'));
      console.log(`Watcher initialized for ${paths.length} enabled unique paths.`);
    } else {
      console.log('[Watcher] No paths to watch (rules disabled or license inactive).');
      this.watcher = null;
    }
  }

  async reload() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    this.init();
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
    const triggeredRules = this.rulesList.filter(r => r.file_path.split(',').map(p => p.trim()).includes(path));
    if (triggeredRules.length === 0) return;

    for (const rule of triggeredRules) {
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
}

module.exports = new WatcherService();
