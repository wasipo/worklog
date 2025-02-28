import './styles.css';

export function MonthSelect({ value, onChange }) {
  // 過去12ヶ月分の選択肢を生成
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    for (let i = 0; i < 12; i++) {
      let year = currentYear;
      let month = currentMonth - i;

      if (month < 0) {
        month += 12;
        year -= 1;
      }

      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
      const label = `${year}年${month + 1}月`;
      options.push({ value: yearMonth, label });
    }

    return options;
  };

  return (
    <select 
      className="month-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {generateMonthOptions().map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
