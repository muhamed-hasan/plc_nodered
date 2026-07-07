const crypto = require('crypto');
const License = require('../models/license');
const PLCService = require('./plc');
const getDeviceId = require('./device');

// 'MY_SECRET_KEY_123' obfuscated as char codes to avoid plain text strings in source searches
const SECRET_CODES = [77, 89, 95, 83, 69, 67, 82, 69, 84, 95, 75, 69, 89, 95, 49, 50, 51];
const SECRET = String.fromCharCode(...SECRET_CODES);

const SERVER_URL_ACTIVATE = 'https://industry-run.com/licence/activate.php';
const SERVER_URL_CHECK = 'https://industry-run.com/licence/check.php';
const GRACE_PERIOD = 7 * 24 * 60 * 60; // 7 days in seconds

// Local signature salt to sign last_check metadata
const LOCAL_SALT = 'LOCAL_SALT_PROTECTION_KEY_987';

function generateLocalCheckSignature(lastCheckTime, deviceId) {
  return crypto
    .createHmac('sha256', deviceId + LOCAL_SALT)
    .update(String(lastCheckTime))
    .digest('hex');
}

class LicenseManager {
  static getStatus() {
    const lic = License.get();
    if (!lic) {
      return { status: 'not_activated', message: 'No license found.' };
    }

    // Verify server signature
    const payload = JSON.stringify({
      key: lic.key,
      email: lic.email,
      device: lic.device_id,
      expire: lic.expire
    });
    const sign = crypto
      .createHmac('sha256', SECRET)
      .update(payload)
      .digest('hex');

    if (sign !== lic.signature) {
      return { status: 'tampered', message: 'License signature invalid.' };
    }

    // Verify local database signature to prevent last_check manipulation
    if (lic.last_check) {
      const localSign = generateLocalCheckSignature(lic.last_check, lic.device_id);
      if (localSign !== lic.local_signature) {
        return { status: 'tampered', message: 'License metadata tampered.' };
      }
    }

    // Clock tampering protection
    const Settings = require('../models/settings');
    const settings = Settings.get();
    const now = Math.floor(Date.now() / 1000);

    if (settings && settings.last_observed_time && now < settings.last_observed_time) {
      return { status: 'tampered', message: 'System clock tampering detected. Please correct your system time.' };
    }

    // Update last_observed_time in DB
    if (settings) {
      Settings.updateLastObservedTime(Math.max(now, settings.last_observed_time || 0));
    } else {
      Settings.updateLastObservedTime(now);
    }

    const expireTime = new Date(lic.expire).getTime() / 1000;

    if (expireTime < now) {
      return { status: 'expired', message: 'License is expired.', key: lic.key, email: lic.email, expire: lic.expire };
    }

    if (now - lic.last_check > GRACE_PERIOD) {
      return { status: 'grace_expired', message: 'Offline grace period exceeded. Connect to internet.', key: lic.key, email: lic.email, expire: lic.expire };
    }

    const remainingDays = Math.ceil((expireTime - now) / (24 * 60 * 60));
    return {
      status: 'active',
      key: lic.key,
      email: lic.email,
      expire: lic.expire,
      remaining_days: remainingDays
    };
  }

  static async activate(key, email) {
    const deviceId = getDeviceId();
    try {
      const response = await fetch(SERVER_URL_ACTIVATE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, email, device: deviceId })
      });
      const result = await response.json();

      if (result.status === 'active') {
        const lastCheck = Math.floor(Date.now() / 1000);
        const licData = {
          key: result.license.key,
          email: result.license.email,
          device_id: result.license.device,
          expire: result.license.expire,
          signature: result.signature,
          last_check: lastCheck,
          local_signature: generateLocalCheckSignature(lastCheck, result.license.device)
        };
        License.set(licData);

        // Attempt PLC connection if configured
        const Settings = require('../models/settings');
        const settings = Settings.get();
        if (settings && settings.plc_ip_address && settings.plc_port) {
          PLCService.connect(settings.plc_ip_address, settings.plc_port, settings.plc_unit_id);
        }

        // Reload watcher to start watching rules
        const watcherService = require('./watcher');
        watcherService.reload();
      } else {
        // Clear local license on verification failure
        License.clear();
        
        // Reload watcher to stop watching rules
        const watcherService = require('./watcher');
        watcherService.reload();
      }
      return result;
    } catch (error) {
      console.error('Activation network error:', error.message);
      return { status: 'server_error', message: 'Could not reach license server' };
    }
  }

  static deactivate() {
    License.clear();
    
    // Reload watcher to stop watching rules
    const watcherService = require('./watcher');
    watcherService.reload();
    return { success: true };
  }

  static startPeriodicCheck() {
    // Check every 6 hours
    setInterval(async () => {
      const lic = License.get();
      if (!lic) return;

      // Verify signature first
      const payload = JSON.stringify({
        key: lic.key,
        email: lic.email,
        device: lic.device_id,
        expire: lic.expire
      });
      const sign = crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('hex');

      if (sign !== lic.signature) {
        console.error('Periodic check failed: signature invalid.');
        const watcherService = require('./watcher');
        watcherService.reload();
        return;
      }

      // Verify local database signature
      if (lic.last_check) {
        const localSign = generateLocalCheckSignature(lic.last_check, lic.device_id);
        if (localSign !== lic.local_signature) {
          console.error('Periodic check failed: local signature invalid.');
          const watcherService = require('./watcher');
          watcherService.reload();
          return;
        }
      }

      try {
        const response = await fetch(SERVER_URL_CHECK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: lic.key, device: lic.device_id })
        });
        const result = await response.json();

        if (result.status === 'active') {
          const lastCheck = Math.floor(Date.now() / 1000);
          License.set({
            key: lic.key,
            email: lic.email,
            device_id: lic.device_id,
            expire: result.expire || lic.expire,
            signature: lic.signature,
            last_check: lastCheck,
            local_signature: generateLocalCheckSignature(lastCheck, lic.device_id)
          });
          console.log('Periodic check: License is active. Updated last_check.');
        } else if (['blocked', 'device_mismatch', 'expired'].includes(result.status)) {
          // Force expire local license
          const lastCheck = lic.last_check;
          License.set({
            key: lic.key,
            email: lic.email,
            device_id: lic.device_id,
            expire: '1970-01-01',
            signature: lic.signature,
            last_check: lastCheck,
            local_signature: generateLocalCheckSignature(lastCheck, lic.device_id)
          });
          console.warn(`Periodic check: License became ${result.status}. Reloading watcher.`);
          const watcherService = require('./watcher');
          watcherService.reload();
        }
      } catch (error) {
        console.warn('Periodic check failed to reach license server. Relying on grace period.', error.message);
        
        // Clock tampering check during offline state
        const Settings = require('../models/settings');
        const settings = Settings.get();
        const now = Math.floor(Date.now() / 1000);

        if (settings && settings.last_observed_time && now < settings.last_observed_time) {
          console.error('Clock tampering detected during periodic check.');
          const watcherService = require('./watcher');
          watcherService.reload();
          return;
        }

        // Update last_observed_time
        if (settings) {
          Settings.updateLastObservedTime(Math.max(now, settings.last_observed_time || 0));
        } else {
          Settings.updateLastObservedTime(now);
        }

        if (now - lic.last_check > GRACE_PERIOD) {
          console.error('Grace period expired during offline check. Reloading watcher.');
          const watcherService = require('./watcher');
          watcherService.reload();
        }
      }
    }, 6 * 60 * 60 * 1000);
  }
}

module.exports = LicenseManager;
