"use client";
import { useState, useEffect, useCallback } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ plc_ip_address: "", plc_port: 502, plc_unit_id: 255 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [plcStatus, setPlcStatus] = useState(null);

  const [licenseKey, setLicenseKey] = useState("");
  const [licenseEmail, setLicenseEmail] = useState("");
  const [updatingLicense, setUpdatingLicense] = useState(false);
  const [licenseMsg, setLicenseMsg] = useState(null);
  const [licenseInfo, setLicenseInfo] = useState(null);

  const fetchLicenseStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/license/status");
      if (res.ok) setLicenseInfo(await res.json());
    } catch (_) {}
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/settings/status");
      if (res.ok) setPlcStatus(await res.json());
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.plc_ip_address) {
          setSettings({
            plc_ip_address: data.plc_ip_address,
            plc_port: data.plc_port || 502,
            plc_unit_id: data.plc_unit_id !== undefined ? data.plc_unit_id : 255
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetchStatus();
    fetchLicenseStatus();
    const interval = setInterval(() => {
      fetchStatus();
      fetchLicenseStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus, fetchLicenseStatus]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plc_ip_address: settings.plc_ip_address,
          plc_port: Number(settings.plc_port),
          plc_unit_id: Number(settings.plc_unit_id),
        }),
      });
      const data = await res.json();
      setTestResult(data);
      fetchStatus();
    } catch {
      setTestResult({ success: false, message: "Request failed — check backend connection." });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setTestResult(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plc_ip_address: settings.plc_ip_address,
          plc_port: Number(settings.plc_port),
          plc_unit_id: Number(settings.plc_unit_id),
        }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Settings saved. Reconnecting to PLC..." });
        setTimeout(fetchStatus, 2000);
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.error || "Failed to save settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Network error — could not reach backend." });
    }
    setSaving(false);
  };

  const handleLicenseUpdate = async (e) => {
    e.preventDefault();
    if (!licenseKey.trim() || !licenseEmail.trim()) return;
    setUpdatingLicense(true);
    setLicenseMsg(null);

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: licenseKey.trim(), email: licenseEmail.trim() })
      });
      const data = await res.json();

      if (data.status === "active") {
        setLicenseMsg({ type: "success", text: "License successfully updated and validated." });
        setLicenseKey("");
        setLicenseEmail("");
        fetchLicenseStatus();
      } else {
        const messages = {
          blocked: "This license has been blocked.",
          expired: "This license is expired.",
          device_mismatch: "This license is bound to another device.",
          invalid: "Invalid license key.",
          server_error: "Could not connect to license server."
        };
        setLicenseMsg({ type: "error", text: messages[data.status] || "License update failed." });
      }
    } catch (e) {
      setLicenseMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setUpdatingLicense(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm("Are you sure you want to deactivate the system? This will disconnect the PLC and lock the dashboard.")) return;
    setUpdatingLicense(true);
    setLicenseMsg(null);

    try {
      const res = await fetch("/api/license/deactivate", { method: "POST" });
      if (res.ok) {
        window.location.reload();
      } else {
        setLicenseMsg({ type: "error", text: "Failed to deactivate license." });
      }
    } catch (e) {
      setLicenseMsg({ type: "error", text: "Network error occurred." });
    } finally {
      setUpdatingLicense(false);
    }
  };

  const statusClass = plcStatus?.connected ? "online" : plcStatus ? "offline" : "unknown";
  const statusLabel = plcStatus?.connected
    ? `Connected — ${plcStatus.ip}:${plcStatus.port}`
    : plcStatus?.configured
    ? "Disconnected"
    : "Not configured";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">PLC Settings</h1>
          <p className="page-subtitle">Configure the Modbus TCP connection to your PLC.</p>
        </div>
        <span className={`status-badge ${statusClass}`}>
          <span className={`status-dot ${statusClass}`} />
          {statusLabel}
        </span>
      </div>

      <div className="glass-card">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading saved settings…</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="ip">PLC IP Address</label>
              <input
                id="ip"
                type="text"
                required
                className="form-input"
                placeholder="e.g. 192.168.184.205"
                value={settings.plc_ip_address}
                onChange={(e) => setSettings({ ...settings, plc_ip_address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="port">Modbus TCP Port</label>
              <input
                id="port"
                type="number"
                required
                min={1}
                max={65535}
                className="form-input"
                placeholder="502"
                value={settings.plc_port}
                onChange={(e) => setSettings({ ...settings, plc_port: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="unit_id">Modbus Unit ID</label>
              <input
                id="unit_id"
                type="number"
                required
                min={0}
                max={255}
                className="form-input"
                placeholder="255"
                value={settings.plc_unit_id}
                onChange={(e) => setSettings({ ...settings, plc_unit_id: e.target.value })}
              />
            </div>

            {testResult && (
              <div className={`alert ${testResult.success ? "alert-success" : "alert-error"}`}>
                {testResult.success ? "✓" : "✗"} {testResult.message}
              </div>
            )}

            {message && (
              <div className={`alert ${message.type === "error" ? "alert-error" : "alert-success"}`}>
                {message.text}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTest}
                disabled={testing || !settings.plc_ip_address}
              >
                {testing ? <><span className="spinner" /> Testing…</> : "Test Connection"}
              </button>
              <button type="submit" disabled={saving} className="btn btn-primary">
                {saving ? <><span className="spinner" /> Saving…</> : "Save Settings"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* License Configuration Card */}
      <div className="glass-card" style={{ marginTop: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>License Configuration</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          View and manage the active license key for this system.
        </p>

        {licenseInfo && (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Current Key:</span>
              <span style={{ fontFamily: "monospace", fontWeight: "600" }}>{licenseInfo.key || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Registered Email:</span>
              <span>{licenseInfo.email || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Status:</span>
              <span style={{
                color: licenseInfo.status === "active" ? "var(--success)" : "var(--danger)",
                fontWeight: "600",
                textTransform: "capitalize"
              }}>
                {licenseInfo.status}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Expiry Date:</span>
              <span>{licenseInfo.expire || "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "0.5rem" }}>
              <span style={{ color: "var(--text-muted)" }}>Remaining Days:</span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{licenseInfo.remaining_days !== undefined ? licenseInfo.remaining_days : "—"}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleLicenseUpdate}>
          <div className="form-group">
            <label className="form-label" htmlFor="newLicenseEmail">Registered Email</label>
            <input
              id="newLicenseEmail"
              type="email"
              required
              className="form-input"
              placeholder="e.g. client@example.com"
              value={licenseEmail}
              onChange={(e) => setLicenseEmail(e.target.value)}
              disabled={updatingLicense}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="newLicenseKey">Change License Key</label>
            <input
              id="newLicenseKey"
              type="text"
              required
              className="form-input"
              placeholder="Enter new license key"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              disabled={updatingLicense}
            />
          </div>

          {licenseMsg && (
            <div className={`alert ${licenseMsg.type === "error" ? "alert-error" : "alert-success"}`} style={{ marginBottom: "1rem" }}>
              {licenseMsg.text}
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button type="submit" className="btn btn-primary" disabled={updatingLicense || !licenseKey.trim() || !licenseEmail.trim()}>
              {updatingLicense ? "Updating..." : "Update License Key"}
            </button>
            <button type="button" className="btn btn-danger" onClick={handleDeactivate} disabled={updatingLicense}>
              Deactivate System
            </button>
          </div>
        </form>
      </div>

      <div className="glass-card" style={{ marginTop: "1.5rem" }}>
        <p className="debug-section-title">Default Values (from Node-RED flow)</p>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          <span>IP: <code style={{ color: "var(--accent-primary)" }}>192.168.184.205</code></span>
          <span>Port: <code style={{ color: "var(--accent-primary)" }}>502</code></span>
          <span>Unit ID: <code style={{ color: "var(--accent-primary)" }}>255</code> (Logo PLC)</span>
        </div>
      </div>
    </div>
  );
}

