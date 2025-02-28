import { useState } from 'react';
import { MonthSelect } from './components/MonthSelect';
import { AttendanceTable } from './components/AttendanceTable';
import { saveMonthlyData, getMonthlyData } from './utils/monthlyData';
import { calculateWorkingHours } from './utils/timeUtils';
import { fetchAttendanceLogs } from './api/attendance';

export function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetchLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchAttendanceLogs(selectedMonth);
      const processedLogs = data.map(log => ({
        ...log,
        breakTime: log.breakTime || '1:00',
        workingHours: calculateWorkingHours(log.clockIn, log.clockOut, log.breakTime || '1:00')
      }));
      setLogs(processedLogs);

      if (processedLogs.length > 0) {
        saveMonthlyData(selectedMonth, processedLogs);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
      setError(error.message || '勤怠データの取得に失敗しました。もう一度お試しください。');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    setLogs([]); // 月を変更したら既存のデータをクリア
    setError(null);
  };

  const handleBreakTimeChange = (index, breakTime) => {
    if (!breakTime.match(/^\d{1,2}:\d{2}$/)) return;

    const updatedLogs = logs.map((log, i) => {
      if (i === index) {
        return {
          ...log,
          breakTime,
          workingHours: calculateWorkingHours(log.clockIn, log.clockOut, breakTime)
        };
      }
      return log;
    });

    setLogs(updatedLogs);
    if (selectedMonth) {
      saveMonthlyData(selectedMonth, updatedLogs);
    }
  };

  return (
    <div className="attendance-container">
      <div className="attendance-header">
        <MonthSelect
          value={selectedMonth}
          onChange={handleMonthChange}
        />
        <button
          className="fetch-button"
          onClick={handleFetchLogs}
          disabled={loading}
        >
          {loading && <div className="loading-spinner" />}
          {loading ? 'データを取得中...' : '勤怠記録を取得'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          {!import.meta.env.VITE_SLACK_TOKEN && (
            <p className="error-hint">
              開発モード: .envファイルにSlackトークンが設定されていません
            </p>
          )}
        </div>
      )}

      {loading && <div className="loading-message">データを取得しています...</div>}

      {!loading && logs.length > 0 && (
        <AttendanceTable
          logs={logs}
          onBreakTimeChange={handleBreakTimeChange}
        />
      )}

      {!loading && !error && logs.length === 0 && (
        <p className="empty-message">
          勤怠記録を取得してください<br />
          <span style={{ fontSize: '0.9em', color: '#9ca3af' }}>
            {selectedMonth.replace('-', '年')}月の記録を取得します
          </span>
        </p>
      )}
    </div>
  );
}
