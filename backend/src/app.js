const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const settingsRoutes = require('./api/settings');
const rulesRoutes = require('./api/rules');
const manualRoutes = require('./api/manual');
const logsRoutes = require('./api/logs');
const debugRoutes = require('./api/debug');
const licenseRoutes = require('./api/license');

// Routes
app.use('/api/settings', settingsRoutes);
app.use('/api/rules', rulesRoutes);
app.use('/api/manual', manualRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/license', licenseRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
