const ModbusRTU = require('modbus-serial');
const eventBus = require('./eventBus');

const client = new ModbusRTU();
let isConnected = false;
let connectRetryTimeout = null;
let currentIp = null;
let currentPort = null;
let currentUnitId = 255;

class PLCService {
  /**
   * Connect to the Modbus TCP PLC
   * @param {string} ip
   * @param {number} port
   * @param {number} unitId
   */
  static async connect(ip, port, unitId = 255) {
    if (this.connectRetryTimeout) {
      clearTimeout(this.connectRetryTimeout);
    }

    // Attempt closing existing connection if connected
    if (isConnected) {
      this.disconnect();
    }

    currentIp = ip;
    currentPort = port;
    currentUnitId = unitId;

    try {
      console.log(`Connecting to PLC at ${ip}:${port} (Unit ID: ${unitId})...`);
      await client.connectTCP(ip, { port });
      client.setID(unitId);
      isConnected = true;

      if (client._port && client._port._client) {
        const socket = client._port._client;
        socket.on('error', (err) => {
          const msg = `PLC socket error: ${err.message}`;
          console.error(msg);
          eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
          if (isConnected) {
            isConnected = false;
            PLCService.triggerReconnect();
          }
        });
        socket.on('close', () => {
          if (isConnected) {
            const msg = 'PLC socket closed unexpectedly. Retrying in 5s...';
            console.warn(msg);
            eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
            isConnected = false;
            PLCService.triggerReconnect();
          }
        });
      }

      const msg = `Successfully connected to PLC at ${ip}:${port} (Unit ID: ${unitId}).`;
      console.log(msg);
      eventBus.emit('log', { timestamp: Date.now(), type: 'INFO', message: msg });
    } catch (error) {
      isConnected = false;
      const msg = `Failed to connect to PLC: ${error.message}. Retrying in 5s...`;
      console.error(msg);
      eventBus.emit('log', { timestamp: Date.now(), type: 'WARN', message: msg });

      // Retry in 5 seconds
      this.connectRetryTimeout = setTimeout(() => {
        this.connect(ip, port, unitId);
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
    return isConnected && client.isOpen;
  }

  static getClient() {
    return client;
  }

  static getStatus() {
    return {
      connected: this.isConnected(),
      ip: currentIp,
      port: currentPort,
      unit_id: currentUnitId,
    };
  }

  static triggerReconnect() {
    if (this.connectRetryTimeout) {
      clearTimeout(this.connectRetryTimeout);
    }
    this.connectRetryTimeout = setTimeout(() => {
      if (currentIp && currentPort) {
        console.log(`Attempting automatic PLC reconnection to ${currentIp}:${currentPort}...`);
        this.connect(currentIp, currentPort, currentUnitId);
      }
    }, 5000);
  }
}

// Handle unexpected closures
client.on('error', (err) => {
  const msg = `PLC connection error: ${err.message}`;
  console.error(msg);
  eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
  if (isConnected) {
    isConnected = false;
    PLCService.triggerReconnect();
  }
});

client.on('close', () => {
  if (isConnected) {
    const msg = 'PLC connection closed unexpectedly. Retrying in 5s...';
    console.warn(msg);
    eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
    isConnected = false;
    PLCService.triggerReconnect();
  } else {
    isConnected = false;
  }
});

module.exports = PLCService;

