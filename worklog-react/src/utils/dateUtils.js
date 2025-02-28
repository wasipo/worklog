/**
 * 日付と時間の操作ユーティリティ
 */

export const formatYearMonth = (yearMonth) => {
  try {
    const [year, month] = yearMonth.split('-');
    return `${year}年${month}月`;
  } catch (error) {
    console.error('年月フォーマットエラー:', error);
    return yearMonth;
  }
};

export const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return dateStr;
  }
};

export const formatTime = (time) => {
  try {
    const date = new Date(time);
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('時刻フォーマットエラー:', error);
    return time;
  }
};
