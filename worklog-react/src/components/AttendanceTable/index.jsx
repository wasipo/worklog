import './styles.css';
import { formatDate, formatTime, getWeekday } from '../../utils/dateUtils';

export function AttendanceTable({ logs, onBreakTimeChange }) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return null;
  }

  // 合計時間の計算（"---" の場合はスキップ）
  const totalMinutes = logs.reduce((acc, log) => {
    if (!log.workingHours || log.workingHours === '---') return acc;
    const [hours, minutes] = log.workingHours.split(':').map(n => parseInt(n, 10));
    return acc + (hours * 60 + minutes);
  }, 0);

  const formatTotal = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  // 日付と曜日の表示用フォーマット関数
  const formatDateWithWeekday = (dateStr) => {
    if (!dateStr || dateStr === '---') return '---';
    const weekday = getWeekday(dateStr);
    const weekdayClass = weekday === '日' ? 'sunday' : 
                        weekday === '土' ? 'saturday' : '';
    return (
      <span className={weekdayClass}>
        {formatDate(dateStr)}（{weekday}）
      </span>
    );
  };

  return (
    <div className="table-container">
      <table className="attendance-table">
        <thead>
          <tr>
            <th>日付</th>
            <th>出勤時刻</th>
            <th>退勤時刻</th>
            <th>休憩時間</th>
            <th>稼働時間</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={`${log.date}-${index}`}>
              <td>{formatDateWithWeekday(log.date)}</td>
              <td>{formatTime(log.clockIn)}</td>
              <td>{formatTime(log.clockOut)}</td>
              <td>
                <input
                  type="text"
                  className="break-time-input"
                  value={log.breakTime}
                  onChange={(e) => onBreakTimeChange(index, e.target.value)}
                  pattern="\d{1,2}:\d{2}"
                />
              </td>
              <td className="working-hours">{log.workingHours || '---'}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="4" style={{ textAlign: 'right' }}>合計稼働時間:</td>
            <td className="working-hours">{formatTotal(totalMinutes)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
