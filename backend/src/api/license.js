const express = require('express');
const LicenseManager = require('../services/licenseManager');

const router = express.Router();

// GET /api/license/status
router.get('/status', (req, res) => {
  try {
    const status = LicenseManager.getStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching license status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/activate', async (req, res) => {
  const { key, email } = req.body;
  if (!key || typeof key !== 'string') {
    return res.status(400).json({ status: 'invalid', message: 'License key is required.' });
  }
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ status: 'invalid', message: 'Registered email is required.' });
  }

  try {
    const result = await LicenseManager.activate(key, email);
    res.json(result);
  } catch (error) {
    console.error('Error activating license:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/license/deactivate
router.post('/deactivate', (req, res) => {
  try {
    const result = LicenseManager.deactivate();
    res.json(result);
  } catch (error) {
    console.error('Error deactivating license:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
