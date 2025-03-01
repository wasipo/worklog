import { useState } from 'react';
import { MonthSelect } from './components/MonthSelect';
import { AttendanceTable } from './components/AttendanceTable';
import { fetchAttendanceLogs } from './api/attendance';
import { calculateWorkingHours, devError } from './utils/timeUtils';
import './Attendance.css';

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

  // データ取得
  const fetchData = async (yearMonth) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAttendanceLogs(yearMonth);
      setLogs(data);
    } catch (err) {
      setError(err.message);
      devError('データ取得エラー:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 月選択時の処理
  const handleMonthChange = (yearMonth) => {
    setSelectedMonth(yearMonth);
  };

  // 休憩時間変更時の処理
  const handleBreakTimeChange = (index, breakTime) => {
    const updatedLogs = logs.map((log, i) => {
      if (i === index) {
        // 常に入力値は受け入れる
        const newLog = { ...log, breakTime };
        
        // フォーマットが正しい場合のみ稼働時間を更新
        if (breakTime.match(/^\d{1,2}:\d{2}$/)) {
          newLog.workingHours = calculateWorkingHours(log.clockIn, log.clockOut, breakTime);
        }
        
        return newLog;
      }
      return log;
    });

    setLogs(updatedLogs);
  };

  // フォーカスが外れた時のバリデーション
  const handleBreakTimeBlur = (index) => {
    const log = logs[index];
    if (!log.breakTime.match(/^\d{1,2}:\d{2}$/)) {
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

      // 3秒後にエラーメッセージを消去
      setTimeout(() => {
        setValidationErrors(prev => {
          const updated = { ...prev };
          delete updated[index];
          return updated;
        });
      }, 3000);
    }
  };

  // ログの削除処理
  const handleDeleteLog = (index) => {
    if (window.confirm('この日の勤怠データを削除しますか？')) {
      const updatedLogs = logs.map((log, i) => {
        if (i === index) {
          // 空のログデータで置き換え
          return {
            ...log,
            clockIn: '---',
            clockOut: '---',
            breakTime: '---',
            workingHours: '---',
            hasBreakMessage: false
          };
        }
        return log;
      });
      setLogs(updatedLogs);
    }
  };

  // ローディング表示
  if (isLoading) {
    return <div className="loading">データを読み込み中...</div>;
  }

  // エラー表示
  if (error) {
    return <div className="error-message">エラーが発生しました: {error}</div>;
  }

  return (
    <div className="attendance-container">
      <div className="controls">
        <MonthSelect value={selectedMonth} onChange={handleMonthChange} />
        <button
          className="fetch-button"
          onClick={() => fetchData(selectedMonth)}
          disabled={isLoading}
        >
          {isLoading ? '読み込み中...' : '勤怠記録を取得'}
        </button>
      </div>
      <AttendanceTable
        logs={logs}
        onBreakTimeChange={handleBreakTimeChange}
        onBreakTimeBlur={handleBreakTimeBlur}
        onDelete={handleDeleteLog}
        validationErrors={validationErrors}
      />
    </div>
  );
}
