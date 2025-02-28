/**
 * テスト環境のセットアップ
 */
import '@testing-library/jest-dom';
import { mockLocalStorage } from './utils/__mocks__/localStorage';

// LocalStorageのモックを設定
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// 各テストの前にLocalStorageをクリア
beforeEach(() => {
  mockLocalStorage.clear();
  jest.clearAllMocks();
});
