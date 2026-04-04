const express = require('express');
const Settings = require('../models/settings');

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

const PLCService = require('../services/plc');

router.post('/', (req, res) => {
  const { plc_ip_address, plc_port } = req.body;

  if (!plc_ip_address || typeof plc_ip_address !== 'string') {
    return res.status(400).json({ error: 'Invalid IP address provided' });
  }

  if (!plc_port || typeof plc_port !== 'number' || plc_port < 1 || plc_port > 65535) {
    return res.status(400).json({ error: 'Invalid port provided' });
  }

  try {
    const updated = Settings.update({ plc_ip_address, plc_port });
    
    // Trigger reconnection
    PLCService.connect(plc_ip_address, plc_port);
    
    res.status(200).json({ success: true, message: 'Settings updated successfully', data: updated });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
