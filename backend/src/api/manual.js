const express = require('express');
const router = express.Router();
const PLCService = require('../services/plc');

router.post('/coil/:id', async (req, res) => {
  try {
    const coilId = parseInt(req.params.id, 10);
    const { state } = req.body;
    
    if (isNaN(coilId) || coilId < 0 || coilId > 7) {
      return res.status(400).json({ error: 'Invalid coil ID. Must be integer 0-7.' });
    }
    
    if (typeof state !== 'boolean') {
      return res.status(400).json({ error: 'Invalid state. Must be a boolean.' });
    }
    
    // Explicit API response even if PLC isn't connected so UI can continue debug.
    if (!PLCService.isConnected()) {
      return res.status(503).json({ error: 'PLC is disconnected. Override ignored.', coil: coilId, requestedState: state });
    }
    
    // The Executor Map queue limits DO NOT restrict this override by mandate.
    await PLCService.getClient().writeCoil(coilId, state);
    console.log(`[Manual Override] Coil ${coilId} directly forced to -> ${state}`);
    
    return res.status(200).json({ success: true, coil: coilId, state });
  } catch (error) {
    console.error(`[Manual Override] Failed writing to coil ${req.params.id}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
