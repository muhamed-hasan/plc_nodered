"use client";
import { useState, useEffect, useRef } from "react";

// ─── Write Panel ─────────────────────────────────────────
function WritePanel() {
  const [dataType, setDataType] = useState("Coil");
  const [address, setAddress] = useState(0);
  const [value, setValue] = useState(true);
  const [intValue, setIntValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleWrite = async () => {
    setLoading(true);
    setResult(null);
    try {
      const payload = {
        dataType,
        address: Number(address),
        value: dataType === "Coil" ? value : Number(intValue),
      };
      const res = await fetch("/api/debug/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data });
    } catch (e) {
      setResult({ ok: false, data: { error: e.message } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <p className="debug-section-title">Write to PLC</p>

      <div className="type-tabs">
        {["Coil", "HoldingRegister"].map((t) => (
          <button key={t} className={`type-tab ${dataType === t ? "active" : ""}`} onClick={() => setDataType(t)}>
            {t === "Coil" ? "Coil (Bool)" : "Holding Register (Int)"}
          </button>
        ))}
      </div>

      <div className="form-row" style={{ marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input type="number" className="form-input" min={0} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">Value</label>
          {dataType === "Coil" ? (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className={`btn ${value ? "btn-success" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setValue(true)}
              >
                ON / true
              </button>
              <button
                className={`btn ${!value ? "btn-danger" : "btn-secondary"}`}
                style={{ flex: 1 }}
                onClick={() => setValue(false)}
              >
                OFF / false
              </button>
            </div>
          ) : (
            <input type="number" className="form-input" value={intValue} onChange={(e) => setIntValue(e.target.value)} />
          )}
        </div>
      </div>

      <button className="btn btn-primary" onClick={handleWrite} disabled={loading} style={{ width: "100%" }}>
        {loading ? <><span className="spinner" />Writing…</> : `Write ${dataType} ${address}`}
      </button>

      {result && (
        <div className={`alert ${result.ok ? "alert-success" : "alert-error"}`} style={{ marginTop: "1rem", marginBottom: 0 }}>
          {result.ok
            ? `✓ Written: ${JSON.stringify(result.data.value)} → ${result.data.dataType} @ addr ${result.data.address}`
            : `✗ Error: ${result.data.error}`}
        </div>
      )}
    </div>
  );
}

// ─── Read Panel ───────────────────────────────────────────
function ReadPanel() {
  const [dataType, setDataType] = useState("HoldingRegister");
  const [address, setAddress] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [autoRead, setAutoRead] = useState(false);
  const [interval, setIntervalMs] = useState(5000);
  const intervalRef = useRef(null);

  const doRead = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/debug/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataType, address: Number(address), quantity: Number(quantity) }),
      });
      const data = await res.json();
      setResult({ ok: res.ok, data, ts: Date.now() });
    } catch (e) {
      setResult({ ok: false, data: { error: e.message }, ts: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoRead) {
      doRead();
      intervalRef.current = setInterval(doRead, interval);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [autoRead, interval, address, quantity, dataType]);

  const values = result?.ok ? result.data.data : null;

  return (
    <div className="glass-card">
      <p className="debug-section-title">Read from PLC</p>

      <div className="type-tabs">
        {["Coil", "HoldingRegister"].map((t) => (
          <button key={t} className={`type-tab ${dataType === t ? "active" : ""}`} onClick={() => setDataType(t)}>
            {t === "Coil" ? "Coil (Bool)" : "Holding Register (Int)"}
          </button>
        ))}
      </div>

      <div className="form-row" style={{ marginBottom: "1rem" }}>
        <div className="form-group">
          <label className="form-label">Start Address</label>
          <input type="number" className="form-input" min={0} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input type="number" className="form-input" min={1} max={125} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem" }}>
        <button className="btn btn-primary" onClick={doRead} disabled={loading} style={{ flex: 1 }}>
          {loading ? <><span className="spinner" />Reading…</> : "Read Once"}
        </button>

        <label className="toggle-switch" style={{ flexShrink: 0 }}>
          <input type="checkbox" checked={autoRead} onChange={(e) => setAutoRead(e.target.checked)} />
          <span className="toggle-track" />
          <span style={{ fontSize: "0.8rem", color: autoRead ? "var(--accent-primary)" : "var(--text-muted)" }}>
            Auto-read
          </span>
        </label>

        {autoRead && (
          <select className="form-select" style={{ width: "auto", flex: "none" }} value={interval} onChange={(e) => setIntervalMs(Number(e.target.value))}>
            <option value={1000}>every 1s</option>
            <option value={5000}>every 5s</option>
            <option value={10000}>every 10s</option>
          </select>
        )}
      </div>

      {result && !result.ok && (
        <div className="alert alert-error">✗ {result.data.error}</div>
      )}

      {values && (
        <div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            Last read: {new Date(result.ts).toLocaleTimeString()}
          </p>
          <div className="register-grid">
            {values.map((v, idx) => (
              <div key={idx} className="register-cell">
                <span className="register-addr">Addr {Number(address) + idx}</span>
                <span className="register-val">{dataType === "Coil" ? (v ? "ON" : "OFF") : v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Coil Quick Control ───────────────────────────────────
function CoilControl() {
  const [coils, setCoils] = useState(Array(8).fill(null));
  const [loading, setLoading] = useState(null);

  const toggleCoil = async (index) => {
    setLoading(index);
    const current = coils[index];
    const targetState = current === true ? false : true;
    try {
      const res = await fetch(`/api/manual/coil/${index}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state: targetState }),
      });
      if (res.ok) {
        setCoils((prev) => { const c = [...prev]; c[index] = targetState; return c; });
      } else {
        const err = await res.json();
        alert(err.error || "Failed to write coil.");
      }
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="glass-card">
      <p className="debug-section-title">Quick Coil Control (Manual Override)</p>
      <div className="coil-grid">
        {coils.map((state, i) => (
          <button
            key={i}
            className={`coil-btn ${state === true ? "on" : state === false ? "off" : ""}`}
            onClick={() => toggleCoil(i)}
            disabled={loading === i}
          >
            <span className="coil-num">Coil M{i}</span>
            <span style={{ fontSize: "1.1rem" }}>{state === true ? "●" : state === false ? "○" : "—"}</span>
            <span className="coil-state">{state === true ? "ON" : state === false ? "OFF" : "unknown"}</span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.75rem" }}>
        Click to toggle. State shown reflects last manual write, not actual PLC read-back.
      </p>
    </div>
  );
}

// ─── Log Terminal ─────────────────────────────────────────
function LogTerminal() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const es = new EventSource("/api/logs/stream");
    es.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        setLogs((prev) => [...prev, payload].slice(-150));
      } catch (_) {}
    };
    es.onerror = () => console.warn("Log stream dropped, reconnecting…");
    return () => es.close();
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  return (
    <div className="glass-card" style={{ marginTop: "1.5rem" }}>
      <p className="debug-section-title">Live Event Log</p>
      <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "0.75rem", padding: "1.25rem", height: "320px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.78rem" }}>
        {logs.length === 0 && <span style={{ color: "var(--text-muted)" }}>Waiting for events…</span>}
        {logs.map((log, i) => (
          <div key={i} style={{ marginBottom: "0.3rem", lineHeight: 1.5 }}>
            <span style={{ color: "var(--text-muted)", marginRight: "0.5rem" }}>
              [{new Date(log.timestamp).toLocaleTimeString()}]
            </span>
            <span style={{ color: log.type === "ERROR" ? "#f87171" : log.type === "WARN" ? "#fbbf24" : "var(--text-muted)", marginRight: "0.5rem" }}>
              [{log.type}]
            </span>
            <span style={{ color: log.type === "ERROR" ? "#f87171" : log.type === "WARN" ? "#fbbf24" : "#86efac" }}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────
export default function DebugPage() {
  return (
    <div>
      <h1 className="page-title">Debug Console</h1>
      <p className="page-subtitle">Manually read and write Modbus data to test PLC communication — mirrors the Node-RED debug flow.</p>

      <div className="debug-grid">
        <WritePanel />
        <ReadPanel />
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <CoilControl />
      </div>

      <LogTerminal />
    </div>
  );
}
