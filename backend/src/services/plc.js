const ModbusRTU = require('modbus-serial');
const eventBus = require('./eventBus');

const client = new ModbusRTU();
let isConnected = false;
let connectRetryTimeout = null;
let currentIp = null;
let currentPort = null;

class PLCService {
  /**
   * Connect to the Modbus TCP PLC
   * @param {string} ip
   * @param {number} port
   */
  static async connect(ip, port) {
    if (this.connectRetryTimeout) {
      clearTimeout(this.connectRetryTimeout);
    }

    // Attempt closing existing connection if connected
    if (isConnected) {
      this.disconnect();
    }

    currentIp = ip;
    currentPort = port;

    try {
      console.log(`Connecting to PLC at ${ip}:${port}...`);
      await client.connectTCP(ip, { port });
      client.setID(1); // Default Modbus Unit ID
      isConnected = true;
      const msg = `Successfully connected to PLC at ${ip}:${port}.`;
      console.log(msg);
      eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
    } catch (error) {
      isConnected = false;
      const msg = `Failed to connect to PLC: ${error.message}. Retrying in 5s...`;
      console.error(msg);
      eventBus.emit('log', { timestamp: Date.now(), type: 'WARN', message: msg });

      // Retry in 5 seconds
      this.connectRetryTimeout = setTimeout(() => {
        this.connect(ip, port);
      }, 5000);
    }
  }

  static disconnect() {
    try {
      if (client.isOpen) {
        client.close();
      }
    } catch (e) {
      console.error('Error during PLC disconnect:', e.message);
    } finally {
      isConnected = false;
    }
  }

  static isConnected() {
    return isConnected;
  }

  static getClient() {
    return client;
  }

  static getStatus() {
    return {
      connected: isConnected,
      ip: currentIp,
      port: currentPort,
    };
  }
}

// Handle unexpected closures
client.on('error', (err) => {
  const msg = `PLC connection error: ${err.message}`;
  console.error(msg);
  eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
  isConnected = false;
});

client.on('close', () => {
  if (isConnected) {
    const msg = 'PLC connection closed unexpectedly.';
    console.warn(msg);
    eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
  }
  isConnected = false;
});

module.exports = PLCService;

