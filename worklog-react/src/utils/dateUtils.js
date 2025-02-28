/**
 * ISO日付文字列を日本語形式（YYYY年MM月DD日）に変換
 * @param {string} isoDate - ISO形式の日付文字列
 * @returns {string} フォーマットされた日付
 */
export const formatDate = (isoDate) => {
  if (!isoDate || isoDate === '---') {
    return '---';
  }

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('日付フォーマットエラー:', error);
    return '---';
  }
};

/**
 * ISO時刻文字列を時:分形式に変換
 * @param {string} isoTime - ISO形式の時刻文字列
 * @returns {string} フォーマットされた時刻
 */
export const formatTime = (isoTime) => {
  if (!isoTime || isoTime === '---') {
    return '---';
  }

  try {
    const date = new Date(isoTime);
    if (isNaN(date.getTime())) throw new Error('Invalid time');
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  } catch (error) {
    console.error('時刻フォーマットエラー:', error);
    return '---';
  }
};

/**
 * ISO日付文字列から曜日を取得
 * @param {string} isoDate - ISO形式の日付文字列
 * @returns {string} 曜日（日〜土）
 */
export const getWeekday = (isoDate) => {
  if (!isoDate || isoDate === '---') {
    return '---';
  }

  try {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) throw new Error('Invalid date');
    return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
  } catch (error) {
    console.error('曜日取得エラー:', error);
    return '---';
  }
};
