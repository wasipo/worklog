import './styles.css';
import { formatYearMonth } from '../../utils/dateUtils';
import { getSavedMonths } from '../../utils/monthlyData';
import { useEffect, useState } from 'react';

export function MonthSelect({ value, onChange }) {
  const [months, setMonths] = useState([]);

  useEffect(() => {
    const savedMonths = getSavedMonths();
    setMonths(savedMonths);

    if (savedMonths.length > 0 && !value) {
      onChange?.(savedMonths[0]);
    }
  }, []);

  return (
    <select
      className="month-select"
      value={value || ''}
      onChange={(e) => onChange?.(e.target.value)}
    >
      <option value="">月を選択</option>
      {months.map(month => (
        <option key={month} value={month}>
          {formatYearMonth(month)}
        </option>
      ))}
    </select>
  );
}
