const os = require('os');
const crypto = require('crypto');

function getDeviceId() {
  const data = os.hostname() + os.platform() + os.arch();
  return crypto
    .createHash('sha256')
    .update(data)
    .digest('hex');
}

module.exports = getDeviceId;
