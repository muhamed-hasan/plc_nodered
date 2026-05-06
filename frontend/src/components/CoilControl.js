'use client';
import { useState } from 'react';

export default function CoilControl() {
  const [coils, setCoils] = useState(Array(8).fill(false));
  const [loading, setLoading] = useState(null);

  const toggleCoil = async (index) => {
    setLoading(index);
    const targetState = !coils[index];
    
    try {
      const res = await fetch(`/api/manual/coil/${index}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: targetState })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (typeof window !== 'undefined') {
            console.warn(`[Coil Control] Warning: ${errorData.error || 'Network Drop'}`);
        }
      }
      
      // We will eagerly render the array flip because offline diagnostics natively catch the array!
      setCoils(prev => {
        const copy = [...prev];
        copy[index] = targetState;
        return copy;
      });
    } catch (e) {
      console.error(e);
      alert('Fatal updating coil state boundary');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ padding: '2rem', border: '1px solid #333', borderRadius: '12px', background: '#111', color: '#fff' }}>
      <h2 style={{ margin: '0 0 1rem 0' }}>Physical Modbus Control Unit</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
        {coils.map((state, i) => (
          <button
            key={i}
            onClick={() => toggleCoil(i)}
            disabled={loading === i}
            style={{
              padding: '15px 20px',
              backgroundColor: state ? '#2ecc71' : '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              opacity: loading === i ? 0.5 : 1
            }}
          >
            Coil {i} <br/> <small>{state ? 'ACTIVE' : 'OFF'}</small>
          </button>
        ))}
      </div>
    </div>
  );
}
