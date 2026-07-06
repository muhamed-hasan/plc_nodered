process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const app = require('./app');
const Settings = require('./models/settings');
const PLCService = require('./services/plc');
const LicenseManager = require('./services/licenseManager');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  const executorService = require('./services/executor');
  const watcherService = require('./services/watcher');
  const settings = Settings.get();
  const licenseStatus = LicenseManager.getStatus();

  // Start periodic license validation checks
  LicenseManager.startPeriodicCheck();

  const bootServices = () => {
    watcherService.init();
  };

  if (settings && settings.plc_ip_address && settings.plc_port) {
    PLCService.connect(settings.plc_ip_address, settings.plc_port, settings.plc_unit_id)
      .then(() => {
        console.log('Synchronous hardware boot bounds evaluated.');
      })
      .finally(() => {
        setTimeout(bootServices, 500); // Wait for hardware state resolving
      });
  } else {
    console.log('No PLC configuration detected. Awaiting setup.');
    bootServices();
  }
});
