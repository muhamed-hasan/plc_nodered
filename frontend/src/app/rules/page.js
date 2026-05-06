"use client";
import { useState, useEffect } from "react";

export default function RulesPage() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({ file_path: "", selectedCoils: [], duration: 500 });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchRules = () => {
    fetch("/api/rules")
      .then(res => res.json())
      .then(data => {
        setRules(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggleCoil = (coilIndex) => {
    setNewRule(prev => {
      const current = [...prev.selectedCoils];
      if (current.includes(coilIndex)) {
        return { ...prev, selectedCoils: current.filter(c => c !== coilIndex) };
      } else {
        return { ...prev, selectedCoils: [...current, coilIndex].sort() };
      }
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newRule.file_path.trim()) {
      setErrorMsg("File paths are strictly logically required.");
      return;
    }
    if (newRule.selectedCoils.length === 0) {
      setErrorMsg("Explicitly select natively at least one Modbus target.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      // Loop organically seamlessly submitting identically perfectly explicitly cleanly 
      const promises = newRule.selectedCoils.map(coilIndex => 
        fetch("/api/rules", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_path: newRule.file_path,
            coil: coilIndex,
            duration: Number(newRule.duration),
            enabled: true
          })
        }).then(res => {
          if (!res.ok) throw new Error(`Target coil ${coilIndex} mapping failed.`);
          return res.json();
        })
      );

      await Promise.all(promises);
      
      setIsModalOpen(false);
      setNewRule({ file_path: "", selectedCoils: [], duration: 500 });
      fetchRules();
    } catch (error) {
      setErrorMsg(error.message || "Failed safely correctly mapping structural limits natively.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Remove safely explicitly structural limits cleanly?")) return;
    try {
      const res = await fetch(`/api/rules/${id}`, { method: "DELETE" });
      if (res.ok) fetchRules();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Dynamic Rule Mapping Dashboard</h1>
          <p className="page-subtitle">Map Node-RED arrays safely dynamically functionally properly accurately natively.</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setIsModalOpen(true)}
        >
          + Inherently Add Target
        </button>
      </div>

      <div className="glass-card" style={{ marginTop: "1rem" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Evaluating Modbus hardware safely...</p>
        ) : rules.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No structural targets seamlessly explicitly found natively.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Target Array Bound</th>
                <th>Hardware Endpoints</th>
                <th>Logic Duration</th>
                <th>Constraints</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(rule => (
                <tr key={rule.id}>
                  <td style={{ maxWidth: '300px', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                    {rule.file_path}
                  </td>
                  <td>
                    <span className="coil-tag">M{rule.coil}</span>
                  </td>
                  <td>{rule.duration}ms</td>
                  <td>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => handleDelete(rule.id)}
                      style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !submitting && setIsModalOpen(false)}>
          <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Dynamic Targets</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>&times;</button>
            </div>
            
            {errorMsg && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{errorMsg}</p>}
            
            <form onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label className="form-label">
                  File Paths (Comma-separated identical bounds realistically neatly flawlessly effectively effortlessly smoothly)
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="/tmp/cam1.json, /tmp/cam2.json"
                  required
                  value={newRule.file_path}
                  onChange={e => setNewRule({...newRule, file_path: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  Modbus Target Hardware Nodes
                </label>
                <div className="checkbox-container">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                    const isSelected = newRule.selectedCoils.includes(i);
                    return (
                      <div 
                        key={i} 
                        className={`coil-checkbox-label ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToggleCoil(i)}
                      >
                        M{i}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Trigger Duration natively smartly accurately (ms)
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  required
                  min={100}
                  value={newRule.duration}
                  onChange={e => setNewRule({...newRule, duration: e.target.value})}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Applying limits...' : 'Map Limits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
