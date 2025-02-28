// 開発用のモックデータを生成する関数
function createMockLogs(yearMonth) {
  const logs = [];
  const [year, month] = yearMonth.split('-').map(Number);
  
  // 指定された月の日数を取得
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // その月の平日のみデータを生成（土日を除く）
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    
    // 土日はスキップ（0=日曜, 6=土曜）
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    // 9:00-18:00のベース時間を設定
    const clockIn = new Date(date);
    clockIn.setHours(9, 0, 0, 0);
    
    const clockOut = new Date(date);
    clockOut.setHours(18, 0, 0, 0);

    logs.push({
      date: date.toISOString().split('T')[0],
      clockIn: clockIn.toISOString(),
      clockOut: clockOut.toISOString(),
      breakTime: "1:00",
      userId: "U01ABC123DE"
    });
  }

  // 日付順にソート
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  
  console.info(`モックデータ生成 (${yearMonth}):`, logs);
  return logs;
}

export async function fetchAttendanceLogs(yearMonth) {
  if (!yearMonth) {
    throw new Error('年月が指定されていません');
  }

  // テスト用の遅延を追加（開発時の動作確認用）
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // 環境変数のチェック
    const isTestMode = import.meta.env.VITE_USE_MOCK === 'true';
    const token = import.meta.env.VITE_SLACK_TOKEN;
    const channel = import.meta.env.VITE_SLACK_CHANNEL;

    // テストモードの場合はモックデータを返す
    if (isTestMode) {
      console.info(`テストモード: ${yearMonth}のモックデータを使用します`);
      return createMockLogs(yearMonth);
    }

    // 本番モードで必要な設定が不足している場合
    if (!token || !channel) {
      throw new Error('Slack APIの設定が不足しています。環境変数を確認してください。');
    }

    // 検索期間の設定（指定された月の1日から末日まで）
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 0).toISOString().split('T')[0];
    const endDate = new Date(year, month, 1).toISOString().split('T')[0];

    console.info('Slack API検索条件:');
    console.info(`- チャンネル: #${channel}`);
    console.info(`- 期間: ${startDate} から ${endDate}`);
    console.info(`- 検索クエリ: "開始します" after:${startDate} before:${endDate}`);
    
    // TODO: Slack API実装
    // 実際のクエリ:
    // client.search.messages({
    //   query: `in:#${channel} "開始します" after:${startDate} before:${endDate}`,
    // });

    throw new Error('Slack API連携は未実装です');

  } catch (error) {
    console.error('データ取得エラー:', error);
    throw error;
  }
}
