const eventBus = require('./eventBus');
const PLCService = require('./plc');
const LicenseManager = require('./licenseManager');

class ExecutorService {
  constructor() {
    this.executionMap = new Map();
    this.executionMap.clear();
    this.setupListeners();
    console.log("Executor Service initialized.");
  }

  setupListeners() {
    eventBus.on('fileTriggered', (payload) => {
      this.handleFileTrigger(payload);
    });
  }

  handleFileTrigger(payload) {
    const { coil, duration } = payload;
    
    // Check license status
    const licenseStatus = LicenseManager.getStatus();
    if (licenseStatus.status !== 'active') {
      const msg = `[Executor] Blocked trigger on coil ${coil}: License is not active (${licenseStatus.status})`;
      console.warn(msg);
      eventBus.emit('log', { timestamp: Date.now(), type: 'WARN', message: msg });
      return;
    }

    try {
      const isDuplicate = this.executionMap.has(coil);

      if (isDuplicate) {
        clearTimeout(this.executionMap.get(coil));
        const msg = `[Executor] Extended queue duration for coil ${coil} (Override)`;
        console.log(msg);
        eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
      }

      if (!isDuplicate) {
        PLCService.getClient().writeCoil(coil, true)
          .then(() => {
            const msg = `[Executor] Wrote ON to coil ${coil}`;
            console.log(msg);
            eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
          })
          .catch(e => {
            const msg = `[Executor] Modbus error on coil ${coil} ON: ${e.message}`;
            console.error(msg);
            eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
          });
      }
      
      const timer = setTimeout(() => {
        PLCService.getClient().writeCoil(coil, false)
          .then(() => {
            const msg = `[Executor] Wrote OFF to coil ${coil}`;
            console.log(msg);
            eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
          })
          .catch(e => {
            const msg = `[Executor] Modbus error on coil ${coil} OFF: ${e.message}`;
            console.error(msg);
            eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
          });
        
        this.executionMap.delete(coil);
      }, duration);

      this.executionMap.set(coil, timer);
    } catch (e) {
      console.error(`[Executor] Fatal parsing error mapping coil ${coil}:`, e.message);
    }
  }
}

module.exports = new ExecutorService();
