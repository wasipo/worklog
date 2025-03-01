import { Attendance } from './Attendance';

function App() {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem'
    }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        勤怠記録閲覧・修正
      </h1>
      <Attendance />
    </div>
  );
}

export default App;
