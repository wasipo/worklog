/**
 * 時間計算ユーティリティ
 */

// 稼働時間を計算 (clockIn, clockOut, breakTimeから実際の稼働時間を計算)
export const calculateWorkingHours = (clockIn, clockOut, breakTime = '1:00') => {
  try {
    // 入力チェック
    if (!clockIn || !clockOut) {
      return '0:00';
    }

    // 出退勤時刻をDateオブジェクトに変換
    const startTime = new Date(clockIn);
    const endTime = new Date(clockOut);

    // 休憩時間を分に変換
    const [breakHours, breakMinutes] = breakTime.split(':').map(Number);
    const breakInMinutes = (breakHours * 60) + breakMinutes;

    // 総稼働時間を計算（ミリ秒を分に変換し、休憩時間を引く）
    const totalMinutes = Math.floor((endTime - startTime) / (1000 * 60)) - breakInMinutes;

    if (totalMinutes < 0) {
      return '0:00';
    }

    // 時間と分に分割
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    // HH:MM形式で返す
    return `${hours}:${minutes.toString().padStart(2, '0')}`;

  } catch (error) {
    console.error('稼働時間計算エラー:', error);
    return '0:00';
  }
};
