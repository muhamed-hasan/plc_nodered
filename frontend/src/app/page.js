"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

function LiveLog() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const es = new EventSource("/api/logs/stream");
    es.onmessage = (e) => {
      try { setLogs((p) => [...p, JSON.parse(e.data)].slice(-80)); } catch (_) {}
    };
    es.onerror = () => {};
    return () => es.close();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", padding: "1.25rem", height: "280px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.75rem" }}>
      {logs.length === 0 && <span style={{ color: "var(--text-muted)" }}>Waiting for system events…</span>}
      {logs.map((log, i) => (
        <div key={i} style={{ marginBottom: "0.25rem", lineHeight: 1.5 }}>
          <span style={{ color: "var(--text-muted)", marginRight: "0.5rem" }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
          <span style={{ color: log.type === "ERROR" ? "#f87171" : log.type === "WARN" ? "#fbbf24" : "var(--text-muted)", marginRight: "0.5rem" }}>[{log.type}]</span>
          <span style={{ color: log.type === "ERROR" ? "#f87171" : log.type === "WARN" ? "#fbbf24" : "#86efac" }}>{log.message}</span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

export default function Home() {
  const [status, setStatus] = useState(null);
  const [rules, setRules] = useState([]);

  useEffect(() => {
    const fetchData = () => {
      fetch("/api/settings/status").then((r) => r.json()).then(setStatus).catch(() => {});
      fetch("/api/rules").then((r) => r.json()).then(setRules).catch(() => {});
    };
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, []);

  const statusClass = status?.connected ? "online" : status ? "offline" : "unknown";
  const statusLabel = status?.connected
    ? `Connected — ${status.ip}:${status.port}`
    : status?.configured ? "Disconnected" : "Not configured";

  const enabledRules = rules.filter((r) => r.enabled);
  const watchedPaths = [...new Set(rules.filter((r) => r.enabled).flatMap((r) => r.file_path.split(",").map((p) => p.trim())))];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Real-time overview of the PLC file-watch trigger system.</p>
        </div>
        <span className={`status-badge ${statusClass}`}>
          <span className={`status-dot ${statusClass}`} />
          {statusLabel}
        </span>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div className="stat-card glass-card" style={{ background: "rgba(6,182,212,0.06)", borderColor: "rgba(6,182,212,0.15)" }}>
          <div className="stat-card-value" style={{ color: "var(--accent-primary)" }}>{enabledRules.length}</div>
          <div className="stat-card-label">Active Rules</div>
        </div>
        <div className="stat-card glass-card" style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.15)" }}>
          <div className="stat-card-value" style={{ color: "var(--accent-secondary)" }}>{watchedPaths.length}</div>
          <div className="stat-card-label">Watched Paths</div>
        </div>
        <div className="stat-card glass-card" style={{ background: status?.connected ? "rgba(16,185,129,0.06)" : "rgba(239,68,68,0.06)", borderColor: status?.connected ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)" }}>
          <div className="stat-card-value" style={{ color: status?.connected ? "var(--success)" : "var(--danger)" }}>
            {status === null ? "—" : status.connected ? "Online" : "Offline"}
          </div>
          <div className="stat-card-label">PLC Status</div>
        </div>
      </div>

      {/* System description */}
      <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.75rem", fontSize: "1.1rem" }}>System Overview</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.7, fontSize: "0.9rem" }}>
          This system replaces the Node-RED flow with a persistent, configurable application. When a watched file changes,
          the corresponding Modbus coil is set <strong>ON</strong> for the configured duration, then automatically set <strong>OFF</strong>.
          Multiple files can be mapped to different coils independently.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
          <Link href="/rules" className="btn btn-primary" style={{ textDecoration: "none" }}>Manage Rules</Link>
          <Link href="/debug" className="btn btn-secondary" style={{ textDecoration: "none" }}>Open Debug Console</Link>
          {!status?.connected && (
            <Link href="/settings" className="btn btn-danger" style={{ textDecoration: "none" }}>Configure PLC →</Link>
          )}
        </div>
      </div>

      {/* Active rules summary */}
      {enabledRules.length > 0 && (
        <div className="glass-card" style={{ marginBottom: "1.5rem" }}>
          <p className="debug-section-title">Active Rule Mappings</p>
          <table className="data-table">
            <thead>
              <tr>
                <th>File Path</th>
                <th>Coil</th>
                <th>ON Duration</th>
              </tr>
            </thead>
            <tbody>
              {enabledRules.map((rule) => (
                <tr key={rule.id}>
                  <td style={{ fontFamily: "monospace", fontSize: "0.78rem", wordBreak: "break-all" }}>{rule.file_path}</td>
                  <td><span className="coil-tag">M{rule.coil}</span></td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>{rule.duration >= 1000 ? `${rule.duration / 1000}s` : `${rule.duration}ms`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Live log */}
      <div className="glass-card">
        <p className="debug-section-title">Live System Log</p>
        <LiveLog />
      </div>
    </div>
  );
}
