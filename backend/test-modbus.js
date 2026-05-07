const ModbusRTU = require('modbus-serial');
const client = new ModbusRTU();

async function test() {
  try {
    await client.connectTCP('127.0.0.1', { port: 5020 }); // will fail
  } catch(e) {
    console.log("Connect error:", e);
  }
  try {
    await client.writeCoil(0, true);
  } catch(e) {
    console.log("WriteCoil error object:", e);
    console.log("WriteCoil error.message:", e ? e.message : 'N/A');
    if (e === undefined) console.log("ERROR IS UNDEFINED");
  }
}
test();
