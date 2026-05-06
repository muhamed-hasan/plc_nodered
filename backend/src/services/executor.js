const eventBus = require('./eventBus');
const PLCService = require('./plc');

class ExecutorService {
  constructor() {
    this.executionMap = new Map();
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
    
    try {
      const isDuplicate = this.executionMap.has(coil);

      if (isDuplicate) {
        clearTimeout(this.executionMap.get(coil));
        console.log(`[Executor] Extended queue duration for coil ${coil} (Override)`);
      }

      if (!isDuplicate) {
        PLCService.getClient().writeCoil(coil, true)
          .then(() => console.log(`[Executor] Wrote ON to coil ${coil}`))
          .catch(e => console.error(`[Executor] Modbus error on coil ${coil} ON:`, e.message));
      }
      
      const timer = setTimeout(() => {
        PLCService.getClient().writeCoil(coil, false)
          .then(() => console.log(`[Executor] Wrote OFF to coil ${coil}`))
          .catch(e => console.error(`[Executor] Modbus error on coil ${coil} OFF:`, e.message));
        
        this.executionMap.delete(coil);
      }, duration);

      this.executionMap.set(coil, timer);
    } catch (e) {
      console.error(`[Executor] Fatal parsing error mapping coil ${coil}:`, e.message);
    }
  }
}

module.exports = new ExecutorService();
