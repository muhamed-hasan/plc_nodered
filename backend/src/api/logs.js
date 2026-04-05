const express = require('express');
const router = express.Router();
const eventBus = require('../services/eventBus');

router.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendLog = (data) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  sendLog({ timestamp: Date.now(), type: 'INFO', message: 'Diagnostic stream connected.' });

  eventBus.on('log', sendLog);

  req.on('close', () => {
    eventBus.removeListener('log', sendLog);
  });
});

module.exports = router;
