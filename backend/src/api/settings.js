const express = require('express');
const Settings = require('../models/settings');
const PLCService = require('../services/plc');
const ModbusRTU = require('modbus-serial');

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const settings = Settings.get();
    if (!settings) {
      return res.status(200).json({});
    }
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/settings/status — live PLC connection state
router.get('/status', (req, res) => {
  try {
    const status = PLCService.getStatus();
    const settings = Settings.get();
    res.json({
      ...status,
      configured: !!(settings && settings.plc_ip_address),
    });
  } catch (error) {
    console.error('Error fetching status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/settings/test-connection — one-shot test, does NOT affect main client
router.post('/test-connection', async (req, res) => {
  const { plc_ip_address, plc_port, plc_unit_id } = req.body;

  if (!plc_ip_address || typeof plc_ip_address !== 'string') {
    return res.status(400).json({ success: false, message: 'Invalid IP address.' });
  }
  if (!plc_port || typeof plc_port !== 'number' || plc_port < 1 || plc_port > 65535) {
    return res.status(400).json({ success: false, message: 'Invalid port number.' });
  }
  if (plc_unit_id !== undefined && (typeof plc_unit_id !== 'number' || plc_unit_id < 0 || plc_unit_id > 255)) {
    return res.status(400).json({ success: false, message: 'Invalid unit ID.' });
  }

  const testClient = new ModbusRTU();
  testClient.on('error', (err) => {
    console.error('Test Modbus client error:', err.message);
  });
  try {
    await Promise.race([
      testClient.connectTCP(plc_ip_address, { port: plc_port }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timed out after 3 seconds.')), 3000)
      ),
    ]);
    testClient.setID(plc_unit_id !== undefined ? plc_unit_id : 255);
    testClient.close();
    return res.json({ success: true, message: `Connected to ${plc_ip_address}:${plc_port} successfully.` });
  } catch (error) {
    try { testClient.close(); } catch (_) {}
    return res.json({ success: false, message: error.message });
  }
});

const handleSave = async (req, res) => {
  const { plc_ip_address, plc_port, plc_unit_id } = req.body;

  if (!plc_ip_address || typeof plc_ip_address !== 'string') {
    return res.status(400).json({ error: 'Invalid IP address provided' });
  }

  if (!plc_port || typeof plc_port !== 'number' || plc_port < 1 || plc_port > 65535) {
    return res.status(400).json({ error: 'Invalid port provided' });
  }

  if (plc_unit_id !== undefined && (typeof plc_unit_id !== 'number' || plc_unit_id < 0 || plc_unit_id > 255)) {
    return res.status(400).json({ error: 'Invalid unit ID provided' });
  }

  try {
    const updated = Settings.update({ plc_ip_address, plc_port, plc_unit_id });

    // Trigger reconnection with main client
    PLCService.connect(plc_ip_address, plc_port, plc_unit_id);

    res.status(200).json({ success: true, message: 'Settings saved successfully.', data: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Accept both POST and PUT from the frontend
router.post('/', handleSave);
router.put('/', handleSave);

module.exports = router;

