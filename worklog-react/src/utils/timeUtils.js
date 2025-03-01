// 時間フォーマットのバリデーション
export const isValidBreakTime = (breakTime) => /^\d{1,2}:\d{2}$/.test(breakTime);

// JSTとしてISO8601フォーマットする関数（9時間のオフセットを正確に処理）
export const toJstISOString = (date) => {
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().replace('Z', '+09:00');
};

// 稼働時間の計算
export const calculateWorkingHours = (clockIn, clockOut, breakTime) => {
  if (clockIn === '---' || clockOut === '---' || breakTime === '---') {
    return '---';
  }

  try {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    
    // 休憩時間をパース
    const [breakHours, breakMinutes] = breakTime.split(':').map(n => parseInt(n, 10));
    const breakDuration = (breakHours * 60 + breakMinutes) * 60 * 1000;
    
    // 稼働時間を計算（ミリ秒）
    const duration = end.getTime() - start.getTime() - breakDuration;
    
    // 時間と分に変換
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}:${String(minutes).padStart(2, '0')}`;
  } catch (error) {
    devError('稼働時間計算エラー:', error);
    return '---';
  }
};

// 開発環境のみのログ出力
export const devLog = (...args) => {
  if (import.meta.env.DEV) {
    console.log(...args);
  }
};

export const devError = (...args) => {
  if (import.meta.env.DEV) {
    console.error(...args);
  }
};
