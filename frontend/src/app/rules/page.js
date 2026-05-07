"use client";
import { useState, useEffect } from "react";

const DEFAULT_PATH = "/home/sdsadmin/kaptifi-vision-ppe-deployment/kaptifi-vision-ppe/database/alarms/alarm_cam_1.json";
const DEFAULT_DURATION = 30000;

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ file_path: "", selectedCoils: [], duration: DEFAULT_DURATION });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pathWarning, setPathWarning] = useState(null);
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const fetchRules = () => {
    fetch("/api/rules")
      .then((res) => res.json())
      .then((data) => { setRules(data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleToggleCoil = (i) => {
    setNewRule((prev) => {
      const s = [...prev.selectedCoils];
      return {
        ...prev,
        selectedCoils: s.includes(i) ? s.filter((c) => c !== i) : [...s, i].sort((a, b) => a - b),
      };
    });
  };

  const doSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      await Promise.all(
        newRule.selectedCoils.map((coil) =>
          fetch("/api/rules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ file_path: newRule.file_path, coil, duration: Number(newRule.duration), enabled: true }),
          }).then((r) => { if (!r.ok) throw new Error(`Failed for coil M${coil}.`); })
        )
      );
      setIsModalOpen(false);
      setNewRule({ file_path: "", selectedCoils: [], duration: DEFAULT_DURATION });
      setPathWarning(null);
      setAwaitingConfirm(false);
      fetchRules();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save rules.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRule.file_path.trim()) { setErrorMsg("File path is required."); return; }
    if (newRule.selectedCoils.length === 0) { setErrorMsg("Select at least one Modbus coil."); return; }
    if (awaitingConfirm) { doSubmit(); return; }

    setSubmitting(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/rules/validate-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file_path: newRule.file_path }),
      });
      const data = await res.json();
      if (!data.valid) {
        setPathWarning(data.paths);
        setAwaitingConfirm(true);
        setSubmitting(false);
        return;
      }
    } catch (_) { /* proceed if validation endpoint unreachable */ }
    setSubmitting(false);
    doSubmit();
  };

  const handleToggleEnabled = async (rule) => {
    try {
      await fetch(`/api/rules/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !rule.enabled }),
      });
      fetchRules();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this rule?")) return;
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (res.ok) fetchRules();
    } catch (err) { console.error(err); }
  };

  const closeModal = () => {
    if (submitting) return;
    setIsModalOpen(false);
    setNewRule({ file_path: "", selectedCoils: [], duration: DEFAULT_DURATION });
    setErrorMsg(""); setPathWarning(null); setAwaitingConfirm(false);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title">Rules Engine</h1>
          <p className="page-subtitle">Map watched file paths to Modbus coil outputs with configurable on-durations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>+ Add Rule</button>
      </div>

      <div className="glass-card" style={{ marginTop: "1rem" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Loading rules…</p>
        ) : rules.length === 0 ? (
          <div className="alert alert-info">No rules configured yet. Click <strong>+ Add Rule</strong> to map a file to a coil.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>File Path</th>
                <th>Coil</th>
                <th>Duration</th>
                <th>Enabled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} style={{ opacity: rule.enabled ? 1 : 0.45 }}>
                  <td style={{ maxWidth: "300px", wordBreak: "break-all", fontFamily: "monospace", fontSize: "0.8rem" }}>{rule.file_path}</td>
                  <td><span className="coil-tag">M{rule.coil}</span></td>
                  <td style={{ fontVariantNumeric: "tabular-nums" }}>
                    {rule.duration >= 1000 ? `${rule.duration / 1000}s` : `${rule.duration}ms`}
                  </td>
                  <td>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={!!rule.enabled} onChange={() => handleToggleEnabled(rule)} />
                      <span className="toggle-track" />
                    </label>
                  </td>
                  <td>
                    <button className="btn btn-danger" onClick={() => handleDelete(rule.id)} style={{ padding: "0.4rem 0.875rem", fontSize: "0.8rem" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Rule</h3>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

            {pathWarning && (
              <div className="alert alert-warning">
                <div>
                  <strong>⚠ Path(s) not found on disk:</strong>
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1.25rem", fontSize: "0.8rem" }}>
                    {pathWarning.map((p) => (
                      <li key={p.path}><code>{p.path}</code> — {!p.exists ? "does not exist" : "not a file"}</li>
                    ))}
                  </ul>
                  <p style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>Click <strong>Save Anyway</strong> to proceed (file may not exist yet).</p>
                </div>
              </div>
            )}

            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">File Path(s)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={DEFAULT_PATH}
                  required
                  value={newRule.file_path}
                  onChange={(e) => { setNewRule({ ...newRule, file_path: e.target.value }); setPathWarning(null); setAwaitingConfirm(false); }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>Separate multiple paths with commas.</p>
              </div>

              <div className="form-group">
                <label className="form-label">Target Modbus Coil(s)</label>
                <div className="checkbox-container">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className={`coil-checkbox-label ${newRule.selectedCoils.includes(i) ? "selected" : ""}`} onClick={() => handleToggleCoil(i)}>M{i}</div>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">ON Duration (ms)</label>
                <input type="number" className="form-input" required min={100} value={newRule.duration}
                  onChange={(e) => setNewRule({ ...newRule, duration: e.target.value })} />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>How long the coil stays ON. Default: 30,000ms (30s) matching original Node-RED flow.</p>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? <><span className="spinner" />Saving…</> : awaitingConfirm ? "Save Anyway" : "Save Rule"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
