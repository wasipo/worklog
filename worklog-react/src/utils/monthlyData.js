/**
 * 月別データの管理
 */
import { saveData, getData } from './storage';

// キーのプレフィックス
const PREFIX = 'worklog';

// 月別キーの生成
export const createMonthKey = (yearMonth) => {
  return `${PREFIX}-${yearMonth}`;
};

// 月別データの保存
export const saveMonthlyData = (yearMonth, data) => {
  const key = createMonthKey(yearMonth);
  return saveData(key, data);
};

// 月別データの取得
export const getMonthlyData = (yearMonth) => {
  const key = createMonthKey(yearMonth);
  return getData(key);
};

// 保存済み月リストの取得
export const getSavedMonths = () => {
  const months = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(PREFIX)) {
      months.push(key.replace(`${PREFIX}-`, ''));
    }
  }
  return months.sort().reverse(); // 新しい順
};
