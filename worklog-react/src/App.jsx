import { Attendance } from './Attendance';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      display: 'flex',
      flexDirection: 'column',
      paddingBlock: '48px',
    }}>
      <header style={{
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2rem)',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '0.5rem'
        }}>
          勤怠管理
        </h1>
        <p style={{
          fontSize: 'clamp(0.875rem, 2vw, 1rem)',
          color: '#64748b'
        }}>
          シンプルな勤怠記録システム
        </p>
      </header>

      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 16px'
      }}>
        <Attendance />
      </main>

      <footer style={{
        textAlign: 'center',
        color: '#94a3b8',
        fontSize: '0.875rem',
        padding: '24px 0 0'
      }}>
        &copy; {new Date().getFullYear()} 勤怠管理システム
      </footer>
    </div>
  );
}

export default App;
