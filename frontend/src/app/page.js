import CoilControl from '../components/CoilControl';
import LogTerminal from '../components/LogTerminal';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', padding: '2rem', background: '#000', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ color: '#fff', textAlign: 'center', marginBottom: '2rem' }}>
          PLC Vision Control Dashboard
        </h1>
        <CoilControl />
        <LogTerminal />
      </div>
    </main>
  );
}
