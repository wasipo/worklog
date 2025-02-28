import { useEffect, useState } from 'react';
import { MonthSelect } from './components/MonthSelect';
import { AttendanceTable } from './components/AttendanceTable';
import { fetchAttendanceLogs } from './api/attendance';
import { calculateWorkingHours, isValidBreakTime, devError } from './utils/timeUtils';

// デフォルトの月を取得（現在の月）
function getDefaultMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(getDefaultMonth());
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // データ取得（明示的にボタンで呼ぶ）
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAttendanceLogs(selectedMonth);
      setLogs(data);
    } catch (err) {
      setError(err.message);
      devError('データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMonthChange = (yearMonth) => {
    setSelectedMonth(yearMonth);
    setLogs([]); // 月が変更されたらログをクリア
  };

  const handleBreakTimeChange = (index, breakTime) => {
    const updatedLogs = logs.map((log, i) => {
      if (i === index) {
        const newLog = { ...log, breakTime };
        if (isValidBreakTime(breakTime)) {
          newLog.workingHours = calculateWorkingHours(log.clockIn, log.clockOut, breakTime);
        }
        return newLog;
      }
      return log;
    });
    setLogs(updatedLogs);
  };

  const handleBreakTimeBlur = (index) => {
    const log = logs[index];
    if (!isValidBreakTime(log.breakTime)) {
      setValidationErrors(prev => ({
        ...prev,
        [index]: '無効な形式です。1:00に戻します。'
      }));

      const updatedLogs = [...logs];
      updatedLogs[index] = {
        ...log,
        breakTime: '1:00',
        workingHours: calculateWorkingHours(log.clockIn, log.clockOut, '1:00')
      };
      setLogs(updatedLogs);

      setTimeout(() => {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }, 3000);
    }
  };

  useEffect(() => {
    setLogs([]);
  }, []);

  return (
    <div className="attendance-container">
      <h1>勤怠記録</h1>
      <div className="attendance-header">
        <MonthSelect value={selectedMonth} onChange={handleMonthChange} />
        <button
          className="fetch-button"
          onClick={() => fetchData(selectedMonth)}
          disabled={isLoading}
        >
          {isLoading ? '読み込み中...' : '勤怠記録を取得'}
        </button>
      </div>

      {isLoading && <div className="loading">データを読み込み中...</div>}
      {error && <div className="error-message">エラーが発生しました: {error}</div>}
      
      {!isLoading && !error && logs.length > 0 && (
        <AttendanceTable
          logs={logs}
          onBreakTimeChange={handleBreakTimeChange}
          onBreakTimeBlur={handleBreakTimeBlur}
          validationErrors={validationErrors}
        />
      )}

      {!isLoading && !error && logs.length === 0 && (
        <p className="empty-message">勤怠記録を取得してください。</p>
      )}
    </div>
  );
}
