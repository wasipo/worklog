// 開発用のモックデータを生成する関数

// ローカル日時をISO形式に変換（UTC変換なし）
function formatLocalISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

// 日本時間で正確な日時を生成
function createLocalDate(year, month, day, hours = 0, minutes = 0) {
  return new Date(year, month - 1, day, hours, minutes, 0);
}

// 月の全日のモックデータを生成（曜日制限なし）
function createMockLogs(yearMonth) {
  const logs = [];
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = createLocalDate(year, month, day);

    const clockIn = createLocalDate(year, month, day, 9, 0);
    const clockOut = createLocalDate(year, month, day, 18, 0);

    logs.push({
      date: formatLocalISO(date).split('T')[0],
      clockIn: formatLocalISO(clockIn),
      clockOut: formatLocalISO(clockOut),
      breakTime: "1:00",
      userId: "U01ABC123DE"
    });
  }

  logs.sort((a, b) => new Date(a.date) - new Date(b.date));

  console.info(`モックデータ生成（全日取得） (${yearMonth}):`, logs);
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

    // 検索期間を明示的に設定（Slack API用）
    const [year, month] = yearMonth.split('-').map(Number);

    // 月初日から1日前（前月末日）
    const startDateObj = new Date(year, month - 1, 1);
    startDateObj.setDate(startDateObj.getDate() - 1);

    // 翌月初日
    const endDateObj = new Date(year, month, 1);

    // ISO8601形式に変換
    const startDate = startDateObj.toISOString().split('T')[0];
    const endDate = endDateObj.toISOString().split('T')[0];

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
