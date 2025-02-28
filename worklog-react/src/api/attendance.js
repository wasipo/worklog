// モックデータ（実際の実装時はfetchAttendance.jsの関数を使用）
const MOCK_LOGS = [
  {
    date: "2025-02-28",
    clockIn: "2025-02-28T00:30:00.000Z",
    clockOut: "2025-02-28T09:45:00.000Z",
    breakTime: "1:00",
    userId: "U01ABC123DE"
  },
  {
    date: "2025-02-27",
    clockIn: "2025-02-27T01:00:00.000Z",
    clockOut: "2025-02-27T10:15:00.000Z",
    breakTime: "1:00",
    userId: "U01ABC123DE"
  },
  {
    date: "2025-02-26",
    clockIn: "2025-02-26T01:15:00.000Z",
    clockOut: "2025-02-26T10:30:00.000Z",
    breakTime: "1:00",
    userId: "U01ABC123DE"
  }
];

export const fetchAttendanceLogs = async () => {
  // APIリクエストをシミュレート
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // モックデータを返却
  return MOCK_LOGS.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// 稼働時間を計算する関数
export const calculateWorkingHours = (clockIn, clockOut, breakTime) => {
  const start = new Date(clockIn);
  const end = new Date(clockOut);
  const [breakHours, breakMinutes] = breakTime.split(':').map(num => parseInt(num, 10));
  const breakTimeInMinutes = breakHours * 60 + breakMinutes;
  
  const totalMinutes = (end - start) / 1000 / 60 - breakTimeInMinutes;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};
