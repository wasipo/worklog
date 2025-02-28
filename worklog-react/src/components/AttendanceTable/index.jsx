import './styles.css';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { calculateWorkingHours } from '../../utils/timeUtils';

export function AttendanceTable({ logs, onBreakTimeChange }) {
  const totalHours = logs.reduce((acc, log) => {
    const [hours, minutes] = log.workingHours.split(':').map(Number);
    return acc + hours * 60 + minutes;
  }, 0);

  const formatTotalHours = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <div className="attendance-table-container">
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
            <tr key={index}>
              <td>{formatDate(log.date)}</td>
              <td>{formatTime(log.clockIn)}</td>
              <td>{formatTime(log.clockOut)}</td>
              <td>
                <input
                  type="text"
                  className="break-time-input"
                  value={log.breakTime}
                  onChange={(e) => onBreakTimeChange(index, e.target.value)}
                  pattern="\d{1,2}:\d{2}"
                  title="休憩時間は「時:分」の形式で入力してください"
                />
              </td>
              <td>{log.workingHours}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan="4">合計稼働時間</td>
            <td>{formatTotalHours(totalHours)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
