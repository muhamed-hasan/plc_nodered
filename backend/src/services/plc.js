const ModbusRTU = require('modbus-serial');

const client = new ModbusRTU();
let isConnected = false;
let connectRetryTimeout = null;

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

    try {
      console.log(`Connecting to PLC at ${ip}:${port}...`);
      await client.connectTCP(ip, { port });
      client.setID(1); // Default Modbus Unit ID
      isConnected = true;
      console.log('Successfully connected to PLC.');
    } catch (error) {
      isConnected = false;
      console.error(`Failed to connect to PLC: ${error.message}`);
      
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
}

// Handle unexpected closures
client.on('error', (err) => {
  console.error('PLC connection error:', err.message);
  isConnected = false;
});

client.on('close', () => {
  if (isConnected) {
    console.warn('PLC connection closed unexpectedly.');
  }
  isConnected = false;
});

module.exports = PLCService;
