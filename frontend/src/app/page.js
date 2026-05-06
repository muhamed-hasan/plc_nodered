export default function Home() {
  return (
    <div>
      <h1 className="page-title">Hardware Vision Dashboard</h1>
      <p className="page-subtitle">Centralized PLC Trigger Monitor & Configuration Base.</p>
      
      <div className="glass-card">
        <h2 style={{ marginBottom: "1rem" }}>System Status</h2>
        <p style={{ color: "var(--text-muted)", lineHeight: 1.6 }}>
          Welcome to the native PLC routing controller. Use the navigation sidebar to access the <strong>Rules Engine</strong>. This enables explicit mapping of multiple camera files to independent Modbus coils natively replacing third-party flow editors like Node-RED. Hardware limitations are managed explicitly within the <strong>Hardware Settings</strong> module securely bridging logic safely to your programmable logic controller dynamically.
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <div style={{ flex: 1, background: 'rgba(6, 182, 212, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Rules Configured</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Active Engine</p>
          </div>
          
          <div style={{ flex: 1, background: 'rgba(139, 92, 246, 0.1)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <h3 style={{ marginBottom: '0.5rem', color: 'var(--accent-secondary)' }}>Hardware Constraints</h3>
            <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>Resolved</p>
          </div>
        </div>
      </div>
    </div>
  );
}
