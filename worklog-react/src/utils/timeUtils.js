// 時間フォーマットのバリデーション
export const isValidBreakTime = (breakTime) => /^\d{1,2}:\d{2}$/.test(breakTime);

// JSTとしてISO8601フォーマットする関数（9時間のオフセットを正確に処理）
export const toJstISOString = (date) => {
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return jstDate.toISOString().replace('Z', '+09:00');
};

// Slack APIの検索用に日付範囲を計算する関数
export const getSlackSearchRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);

  // JSTの月初日の前日をafterに指定（UTC日付に変換不要）
  const afterDate = new Date(year, month - 1, 1);
  afterDate.setDate(afterDate.getDate() - 1);
  const afterDateStr = afterDate.toISOString().split('T')[0];

  // 翌月1日をbeforeに指定（UTC日付に変換不要）
  const beforeDate = new Date(year, month, 1);
  const beforeDateStr = beforeDate.toISOString().split('T')[0];

  return { afterDate: afterDateStr, beforeDate: beforeDateStr };
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
