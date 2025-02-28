import './styles.css';
import { formatDate, formatTime, getWeekday } from '../../utils/dateUtils';

export function AttendanceTable({ logs, onBreakTimeChange, onBreakTimeBlur, validationErrors }) {
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
    return (
      <span>
        {formatDate(dateStr)}（{weekday}）
      </span>
    );
  };

  // 休日判定（打刻データがない日）
  const isHoliday = (log) => {
    // 明示的な休日フラグがある場合はそれを使用
    if (log.isHoliday !== undefined) return log.isHoliday;
    // 後方互換性のため、打刻データがない場合も休日とみなす
    return log.clockIn === '---' && log.clockOut === '---';
  };

  // 入力フィールドのツールチップ表示
  const getInputTitle = (log, index) => {
    if (validationErrors[index]) return validationErrors[index];
    if (log.hasBreakMessage) return '休憩の記録があります';
    return undefined;
  };

  // 入力フィールドのクラス名
  const getInputClassName = (log, index) => {
    const classes = ['break-time-input'];
    if (log.hasBreakMessage) classes.push('highlight');
    if (validationErrors[index]) classes.push('error');
    return classes.join(' ');
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
            <tr 
              key={`${log.date}-${index}`}
              className={isHoliday(log) ? 'holiday-row' : undefined}
            >
              <td>{formatDateWithWeekday(log.date)}</td>
              <td>{formatTime(log.clockIn)}</td>
              <td>{formatTime(log.clockOut)}</td>
              <td className="break-time-cell">
                <input
                  type="text"
                  className={getInputClassName(log, index)}
                  value={log.breakTime}
                  onChange={(e) => onBreakTimeChange(index, e.target.value)}
                  onBlur={() => onBreakTimeBlur(index)}
                  pattern="\d{1,2}:\d{2}"
                  title={getInputTitle(log, index)}
                  placeholder="1:00"
                  disabled={isHoliday(log)}
                />
                {validationErrors[index] && (
                  <div className="validation-error-tooltip">
                    {validationErrors[index]}
                  </div>
                )}
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
