/**
 * 時間計算ユーティリティ
 */

export const calculateWorkingHours = (start, end, breakTime) => {
  try {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const [breakHours, breakMinutes] = breakTime.split(':').map(Number);
    const breakInMinutes = (breakHours * 60) + breakMinutes;

    const diffInMinutes = (endTime - startTime) / 1000 / 60 - breakInMinutes;
    const hours = Math.floor(diffInMinutes / 60);
    const minutes = Math.round(diffInMinutes % 60);

    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('時間計算エラー:', error);
    return '0:00';
  }
};
