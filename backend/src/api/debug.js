const express = require('express');
const router = express.Router();
const PLCService = require('../services/plc');
const eventBus = require('../services/eventBus');

// POST /api/debug/write — write a Coil or Holding Register value
router.post('/write', async (req, res) => {
  const { dataType, address, value } = req.body;

  if (!['Coil', 'HoldingRegister'].includes(dataType)) {
    return res.status(400).json({ error: 'dataType must be "Coil" or "HoldingRegister".' });
  }
  if (typeof address !== 'number' || address < 0) {
    return res.status(400).json({ error: 'address must be a non-negative integer.' });
  }
  if (value === undefined || value === null) {
    return res.status(400).json({ error: 'value is required.' });
  }
  if (!PLCService.isConnected()) {
    return res.status(503).json({ error: 'PLC is not connected.' });
  }

  try {
    const client = PLCService.getClient();
    const timestamp = Date.now();

    if (dataType === 'Coil') {
      const boolVal = Boolean(value);
      await client.writeCoil(address, boolVal);
      const msg = `[Debug Write] Coil ${address} = ${boolVal}`;
      eventBus.emit('log', { timestamp, type: 'INFO', message: msg });
      return res.json({ success: true, dataType, address, value: boolVal, timestamp });
    } else {
      const intVal = parseInt(value, 10);
      if (isNaN(intVal)) return res.status(400).json({ error: 'value must be an integer for HoldingRegister.' });
      await client.writeRegister(address, intVal);
      const msg = `[Debug Write] HoldingRegister ${address} = ${intVal}`;
      eventBus.emit('log', { timestamp, type: 'INFO', message: msg });
      return res.json({ success: true, dataType, address, value: intVal, timestamp });
    }
  } catch (error) {
    const msg = `[Debug Write] Error: ${error.message}`;
    eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/debug/read — read Coils or Holding Registers
router.post('/read', async (req, res) => {
  const { dataType, address, quantity = 1 } = req.body;

  if (!['Coil', 'HoldingRegister'].includes(dataType)) {
    return res.status(400).json({ error: 'dataType must be "Coil" or "HoldingRegister".' });
  }
  if (typeof address !== 'number' || address < 0) {
    return res.status(400).json({ error: 'address must be a non-negative integer.' });
  }
  if (!PLCService.isConnected()) {
    return res.status(503).json({ error: 'PLC is not connected.' });
  }

  try {
    const client = PLCService.getClient();
    const timestamp = Date.now();
    let data;

    if (dataType === 'Coil') {
      const result = await client.readCoils(address, quantity);
      data = result.data;
      const msg = `[Debug Read] Coils ${address}-${address + quantity - 1}: [${data.join(', ')}]`;
      eventBus.emit('log', { timestamp, type: 'INFO', message: msg });
    } else {
      const result = await client.readHoldingRegisters(address, quantity);
      data = result.data;
      const msg = `[Debug Read] HoldingRegisters ${address}-${address + quantity - 1}: [${data.join(', ')}]`;
      eventBus.emit('log', { timestamp, type: 'INFO', message: msg });
    }

    return res.json({ success: true, dataType, address, quantity, data, timestamp });
  } catch (error) {
    const msg = `[Debug Read] Error: ${error.message}`;
    eventBus.emit('log', { timestamp: Date.now(), type: 'ERROR', message: msg });
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
