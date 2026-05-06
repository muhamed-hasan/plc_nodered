const app = require('./app');
const Settings = require('./models/settings');
const PLCService = require('./services/plc');

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Try connecting to PLC if settings exist
  const settings = Settings.get();
  if (settings && settings.plc_ip_address && settings.plc_port) {
    PLCService.connect(settings.plc_ip_address, settings.plc_port);
  } else {
    console.log('No PLC configuration detected. Awaiting setup.');
  }
  // Initialize the File Watcher Service
  const watcherService = require('./services/watcher');
  watcherService.init();

  // Initialize the Executor Service
  const executorService = require('./services/executor');
});
