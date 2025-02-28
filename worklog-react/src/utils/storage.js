/**
 * 基本的なストレージ操作
 */

// 保存
export const saveData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error('保存エラー:', error);
    return false;
  }
};

// 取得
export const getData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('取得エラー:', error);
    return null;
  }
};

// キーの存在確認
export const hasData = (key) => {
  return localStorage.getItem(key) !== null;
};
