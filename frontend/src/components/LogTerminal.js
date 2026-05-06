'use client';
import { useEffect, useState, useRef } from 'react';

export default function LogTerminal() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    const eventSource = new EventSource('/api/logs/stream');

    eventSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        setLogs((prev) => [...prev, payload].slice(-100)); // Cap array to latest 100 to prevent stalling pipelines
      } catch (e) {
        console.error('Failed to parse log stream payload:', e);
      }
    };

    eventSource.onerror = () => {
      console.warn("EventSource dropped, attempting reconnect...");
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{ marginTop: '2rem', background: '#1e1e1e', color: '#00ff00', padding: '1.5rem', borderRadius: '12px', fontFamily: 'monospace', height: '400px', overflowY: 'auto' }}>
      <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '0.8rem', marginBottom: '1rem', color: '#fff', margin: 0 }}>Terminal Diagnostics</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '13px' }}>
        {logs.map((log, i) => (
          <div key={i} style={{ wordBreak: 'break-all' }}>
            <span style={{ color: log.type === 'ERROR' ? '#ff4444' : log.type === 'WARN' ? '#ffaa00' : '#888' }}>
              [{new Date(log.timestamp).toISOString()}] [{log.type}]
            </span>
            <span style={{ marginLeft: '8px', color: log.type === 'ERROR' ? '#ff4444' : log.type === 'WARN' ? '#ffaa00' : '#00ff00' }}>
              {log.message}
            </span>
          </div>
        ))}
        {logs.length === 0 && <div style={{ color: '#666' }}>Waiting for system events...</div>}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
