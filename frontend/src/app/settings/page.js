"use client";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({ plc_ip_address: "", plc_port: 502 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.plc_ip_address) {
          setSettings({
            plc_ip_address: data.plc_ip_address,
            plc_port: data.plc_port || 502,
          });
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching settings:", error);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plc_ip_address: settings.plc_ip_address,
          plc_port: Number(settings.plc_port),
        }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Hardware limits safely bound." });
      } else {
        const error = await res.json();
        setMessage({ type: "error", text: error.error || "Failed to update target bounds." });
      }
    } catch (error) {
      console.error(error);
      setMessage({ type: "error", text: "Network correctly rejected unknown constraint." });
    }
    setSaving(false);
  };

  return (
    <div>
      <h1 className="page-title">Hardware Settings</h1>
      <p className="page-subtitle">Map the explicit hardware bounds manually.</p>

      <div className="glass-card">
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading current targets...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="ip">
                PLC IPv4 Address
              </label>
              <input
                id="ip"
                type="text"
                required
                className="form-input"
                placeholder="Ex. 192.168.0.100"
                value={settings.plc_ip_address}
                onChange={(e) =>
                  setSettings({ ...settings, plc_ip_address: e.target.value })
                }
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="port">
                Modbus TCP Port
              </label>
              <input
                id="port"
                type="number"
                required
                min={1}
                max={65535}
                className="form-input"
                value={settings.plc_port}
                onChange={(e) =>
                  setSettings({ ...settings, plc_port: e.target.value })
                }
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
              style={{ marginTop: "1rem" }}
            >
              {saving ? "Deploying..." : "Update Limits"}
            </button>

            {message && (
              <p
                style={{
                  marginTop: "1.5rem",
                  fontSize: "0.875rem",
                  color: message.type === "error" ? "var(--danger)" : "var(--success)",
                }}
              >
                {message.text}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
