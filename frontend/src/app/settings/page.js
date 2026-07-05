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
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

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

