import './styles.css';
import { formatMonth } from '../../utils/dateUtils';

export function MonthSelect({ value, onChange }) {
  // 過去6ヶ月分の選択肢を生成
  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonth = date.toISOString().slice(0, 7); // YYYY-MM形式
      options.push(yearMonth);
    }
    
    return options;
  };

  return (
    <select
      className="month-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">月を選択</option>
      {getMonthOptions().map(yearMonth => (
        <option key={yearMonth} value={yearMonth}>
          {formatMonth(yearMonth)}
        </option>
      ))}
    </select>
  );
}
