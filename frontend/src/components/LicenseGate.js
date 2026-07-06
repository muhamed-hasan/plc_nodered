"use client";
import { useState, useEffect } from "react";

export default function LicenseGate({ children }) {
  const [status, setStatus] = useState(null); // 'checking' initially
  const [key, setKey] = useState("");
  const [email, setEmail] = useState("");
  const [activating, setActivating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const checkLicense = async () => {
    try {
      const res = await fetch("/api/license/status");
      const data = await res.json();
      setStatus(data.status);
      if (data.status !== "active" && data.message) {
        setErrorMsg(data.message);
      } else {
        setErrorMsg("");
      }
    } catch (e) {
      setStatus("error");
      setErrorMsg("Network error checking license status.");
    }
  };

  useEffect(() => {
    checkLicense();
    // Poll the status every 10 seconds in the background
    const interval = setInterval(checkLicense, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!key.trim() || !email.trim()) return;
    setActivating(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim(), email: email.trim() })
      });
      const data = await res.json();

      if (data.status === "active") {
        setStatus("active");
        setKey("");
      } else {
        const messages = {
          blocked: "This license has been blocked.",
          expired: "This license is expired.",
          device_mismatch: "This license is bound to another device.",
          invalid: "Invalid license key.",
          server_error: "Could not connect to license server."
        };
        setErrorMsg(messages[data.status] || "Activation failed.");
      }
    } catch (e) {
      setErrorMsg("Network error during activation.");
    } finally {
      setActivating(false);
    }
  };

  if (status === null) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", width: "100vw", background: "var(--bg-dark)" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (status === "active") {
    return children;
  }

  return (
    <div style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      width: "100vw",
      background: "var(--bg-dark)",
      backgroundImage: "radial-gradient(circle at 50% -20%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)"
    }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "440px", padding: "2.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "0.5rem", background: "var(--gradient-main)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          License Required
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: "2rem", fontSize: "0.95rem" }}>
          Please enter a valid license key to access the dashboard.
        </p>

        {errorMsg && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem", padding: "0.75rem", borderRadius: "0.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", color: "var(--danger)", fontSize: "0.85rem", textAlign: "left" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleActivate}>
          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label" htmlFor="registeredEmail">Registered Email</label>
            <input
              id="registeredEmail"
              type="email"
              required
              className="form-input"
              placeholder="e.g. client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={activating}
            />
          </div>

          <div className="form-group" style={{ textAlign: "left" }}>
            <label className="form-label" htmlFor="licenseKey">Premium License Key</label>
            <input
              id="licenseKey"
              type="text"
              required
              className="form-input"
              placeholder="e.g. ABC123"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={activating}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }} disabled={activating}>
            {activating ? "Activating..." : "Activate Product"}
          </button>
        </form>
      </div>
    </div>
  );
}
