// 時間フォーマットのバリデーション
export const isValidBreakTime = (breakTime) => /^\d{1,2}:\d{2}$/.test(breakTime);

// JSTとしてISO8601フォーマットする関数（9時間のオフセットを正確に処理）
export const toJstISOString = (dateUTC) => {
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000; // UTC+9時間
  const jstDate = new Date(dateUTC.getTime() + JST_OFFSET_MS);
  return jstDate.toISOString().substring(0,19) + '+09:00';
};

// JSTの月初(1日0:00)〜月末(末日23:59)を漏れなく取得するSlack検索範囲を返す関数
export const getSlackSearchRange = (yearMonth) => {
  const [year, month] = yearMonth.split('-').map(Number);

  // 検索開始日は「前月末日」（JSTで当月1日0:00を確実に含む）
  const afterDate = new Date(Date.UTC(year, month - 1, 1));
  afterDate.setUTCDate(afterDate.getUTCDate() - 1);

  // 検索終了日は「翌月1日」（JSTで月末日23:59まで確実に含む）
  const beforeDate = new Date(Date.UTC(year, month, 1));

  const afterDateStr = afterDate.toISOString().split('T')[0];
  const beforeDateStr = beforeDate.toISOString().split('T')[0];

  devLog('日付範囲計算:', {
    yearMonth,
    afterDateStr,
    beforeDateStr
  });

  return {
    afterDate: afterDateStr,   // 前月最終日
    beforeDate: beforeDateStr, // 翌月1日
  };
};

// 稼働時間の計算
export const calculateWorkingHours = (clockIn, clockOut, breakTime) => {
  if (clockIn === '---' || clockOut === '---' || breakTime === '---') {
    return '---';
  }

  try {
    const start = new Date(clockIn);
    const end = new Date(clockOut);

    // 秒以下を切り捨てる
    start.setSeconds(0, 0);
    end.setSeconds(0, 0);

    // 休憩時間をミリ秒に変換
    const [breakHours, breakMinutes] = breakTime.split(':').map(Number);
    const breakDurationMs = (breakHours * 60 + breakMinutes) * 60 * 1000;

    // 稼働時間（ミリ秒）
    const durationMs = end - start - breakDurationMs;

    if (durationMs <= 0) return '0:00';

    // 時間と分に変換
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

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
