/**
 * 日付と時間のフォーマット機能
 */

// 日付のフォーマット (例: 2024-02-28 → 2024年02月28日)
export const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return dateStr;
  }
};

// 時刻のフォーマット (例: 2024-02-28T09:00:00Z → 09:00)
export const formatTime = (timeStr) => {
  try {
    const date = new Date(timeStr);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid time');
    }
    return new Intl.DateTimeFormat('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('時刻フォーマットエラー:', error);
    return timeStr;
  }
};

// 月のフォーマット (例: 2024-02 → 2024年02月)
export const formatMonth = (yearMonth) => {
  try {
    const [year, month] = yearMonth.split('-');
    return `${year}年${month}月`;
  } catch (error) {
    console.error('年月フォーマットエラー:', error);
    return yearMonth;
  }
};
