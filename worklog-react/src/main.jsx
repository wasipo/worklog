import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 開発時の環境設定チェック
if (import.meta.env.DEV) {
  const envStatus = {
    'モックモード': import.meta.env.VITE_USE_MOCK === 'true' ? '有効' : '無効',
    'Slackトークン': import.meta.env.VITE_SLACK_TOKEN ? '設定済み' : '未設定',
    'Slackチャンネル': import.meta.env.VITE_SLACK_CHANNEL ? '設定済み' : '未設定'
  };

  console.log('環境設定状態:');
  Object.entries(envStatus).forEach(([key, value]) => {
    console.log(`${key}: %c${value}`, 
      `color: ${value.includes('有効') || value === '設定済み' ? 'green' : 'orange'};
       font-weight: bold`
    );
  });

  if (!import.meta.env.VITE_USE_MOCK && (!import.meta.env.VITE_SLACK_TOKEN || !import.meta.env.VITE_SLACK_CHANNEL)) {
    console.warn(
      'Warning: Slack APIの設定が不完全です。\n' +
      'モックモードを使用する場合は .env に VITE_USE_MOCK=true を設定してください。\n' +
      '本番モードを使用する場合は VITE_SLACK_TOKEN と VITE_SLACK_CHANNEL を設定してください。'
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
