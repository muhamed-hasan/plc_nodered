const os = require('os');
const crypto = require('crypto');
const { execSync } = require('child_process');

function getDeviceId() {
  let rawId = '';
  try {
    const platform = os.platform();
    if (platform === 'win32') {
      // Get motherboard/system UUID on Windows
      rawId = execSync('wmic csproduct get uuid')
        .toString()
        .replace(/UUID/g, '')
        .trim();
    } else if (platform === 'darwin') {
      // Get Hardware UUID on macOS
      rawId = execSync("system_profiler SPHardwareDataType | awk '/Hardware UUID/ {print $3}'")
        .toString()
        .trim();
    } else if (platform === 'linux') {
      // Get machine-id on Linux
      try {
        rawId = execSync('cat /var/lib/dbus/machine-id || cat /etc/machine-id')
          .toString()
          .trim();
      } catch (_) {
        rawId = execSync('cat /sys/class/dmi/id/product_uuid')
          .toString()
          .trim();
      }
    }
  } catch (error) {
    console.warn('[DeviceID] Failed to retrieve system hardware ID, using hostname fallback:', error.message);
  }

  // Fallback to hostname if system ID could not be determined or command failed
  if (!rawId) {
    rawId = os.hostname() + '-' + os.platform() + '-' + os.arch();
  }

  return crypto
    .createHash('sha256')
    .update(rawId)
    .digest('hex');
}

module.exports = getDeviceId;
