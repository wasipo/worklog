import { useState } from 'react';
import { MonthSelect } from './components/MonthSelect';
import { AttendanceTable } from './components/AttendanceTable';
import { saveMonthlyData, getMonthlyData } from './utils/monthlyData';
import { calculateWorkingHours } from './utils/timeUtils';
import { Button } from 'react-aria-components';
import { fetchAttendanceLogs } from './api/attendance';

export function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchAttendanceLogs();
      const processedLogs = data.map(log => ({
        ...log,
        breakTime: log.breakTime || '1:00',
        workingHours: calculateWorkingHours(log.clockIn, log.clockOut, log.breakTime || '1:00')
      }));
      setLogs(processedLogs);

      if (processedLogs.length > 0) {
        const month = new Date(processedLogs[0].date).toISOString().slice(0, 7);
        saveMonthlyData(month, processedLogs);
        setSelectedMonth(month);
      }
    } catch (error) {
      console.error('勤怠データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    const monthlyData = getMonthlyData(month);
    if (monthlyData) {
      setLogs(monthlyData.map(log => ({
        ...log,
        workingHours: calculateWorkingHours(log.clockIn, log.clockOut, log.breakTime)
      })));
    } else {
      setLogs([]);
    }
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
        <Button
          onPress={handleFetchLogs}
          className="fetch-button"
          isDisabled={loading}
        >
          {loading && <div className="loading-spinner" />}
          {loading ? '取得中...' : '勤怠記録を取得'}
        </Button>
        <MonthSelect
          value={selectedMonth}
          onChange={handleMonthChange}
        />
      </div>

      {logs.length > 0 ? (
        <AttendanceTable
          logs={logs}
          onBreakTimeChange={handleBreakTimeChange}
        />
      ) : (
        <p className="empty-message">
          {loading ? 'データを取得しています...' : '表示する勤怠記録がありません'}
        </p>
      )}
    </div>
  );
}
