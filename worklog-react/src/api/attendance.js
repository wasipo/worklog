// JSTとしてISO8601フォーマットする関数
function toJstISOString(date) {
  const offset = 9 * 60; // JSTのオフセットは+9時間（分単位）
  const localDate = new Date(date.getTime() + offset * 60 * 1000);
  return localDate.toISOString().replace('Z', '+09:00');
}

// Slack API用のクライアント設定
async function fetchSlackApi(endpoint, params) {
  const token = import.meta.env.VITE_SLACK_TOKEN;
  
  console.info(`Slack API リクエスト: ${endpoint}`, params);
  
  // クエリパラメータをURLエンコード
  const urlParams = new URLSearchParams(params);
  
  const response = await fetch(`/slack-api/${endpoint}?${urlParams}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
  });

  const data = await response.json();
  
  if (!data.ok) {
    console.error('Slack API エラーレスポンス:', data);
    throw new Error(`Slack API Error: ${data.error || '不明なエラー'}`);
  }

  // レスポンスの型チェック
  if (endpoint === 'search.messages' && (!data.messages || !Array.isArray(data.messages.matches))) {
    console.error('予期しないレスポンス形式:', data);
    throw new Error('検索結果が正しい形式ではありません');
  }

  console.info(`Slack API レスポンス: ${endpoint}`, data);
  return data;
}

// スレッドの返信を取得する関数
async function fetchThreadReplies(channelId, ts) {
  const result = await fetchSlackApi('conversations.replies', {
    channel: channelId,
    ts,
    limit: 100,
    inclusive: true
  });

  if (!Array.isArray(result.messages) || result.messages.length === 0) {
    throw new Error('スレッドのメッセージが見つかりません');
  }

  // 最初と最後のメッセージを取得
  const firstMessage = result.messages[0];
  const lastMessage = result.messages[result.messages.length - 1];

  // タイムスタンプをDateオブジェクトに変換（UTC）
  const clockIn = new Date(parseFloat(firstMessage.ts) * 1000);
  const clockOut = new Date(parseFloat(lastMessage.ts) * 1000);

  return {
    clockIn: toJstISOString(clockIn),
    clockOut: toJstISOString(clockOut),
    userId: firstMessage.user
  };
}

// 指定した月の全日付を生成する関数
function generateMonthDates(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const dates = [];
  
  // 月の日数を取得
  const daysInMonth = new Date(year, month, 0).getDate();
  
  // 1日から月末まで配列を生成
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    dates.push(date.toISOString().split('T')[0]);
  }
  
  return dates;
}

// 空のデータを生成する関数
function createEmptyLog(date) {
  return {
    date,
    clockIn: '---',
    clockOut: '---',
    breakTime: '---',
    userId: '---'
  };
}

// モックデータ生成関数
function createMockLogs(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const dates = generateMonthDates(yearMonth);
  
  return dates.map(date => {
    const currentDate = new Date(date);
    const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
    
    if (isWeekend) {
      return createEmptyLog(date);
    }

    const clockIn = new Date(date);
    clockIn.setHours(9, 0, 0, 0);
    
    const clockOut = new Date(date);
    clockOut.setHours(18, 0, 0, 0);

    return {
      date,
      clockIn: toJstISOString(clockIn),
      clockOut: toJstISOString(clockOut),
      breakTime: '1:00',
      userId: 'U01ABC123DE'
    };
  });
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
    const channelId = import.meta.env.VITE_SLACK_CHANNEL_ID;

    // テストモードの場合はモックデータを返す
    if (isTestMode) {
      console.info(`テストモード: ${yearMonth}のモックデータを使用します`);
      return createMockLogs(yearMonth);
    }

    // 本番モードで必要な設定が不足している場合
    if (!token || !channelId) {
      throw new Error('Slack APIの設定が不足しています。環境変数を確認してください。');
    }

    // Step 3: 月の全日付を生成
    const allDates = generateMonthDates(yearMonth);
    console.info('生成された日付一覧:', allDates);

    // 検索期間の設定（今月1日から翌月1日の範囲）
    const [year, month] = yearMonth.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);  // 今月1日
    startDate.setDate(startDate.getDate() - 1);      // 前日指定（after用）
    const endDate = new Date(year, month, 1);        // 翌月1日（before用）
    
    // Slack API用の日付フォーマット
    const afterDate = startDate.toISOString().split('T')[0];
    const beforeDate = endDate.toISOString().split('T')[0];

    // Step 1: メッセージの検索（エンコードなし）
    const searchQuery = `"開始します" after:${afterDate} before:${beforeDate} in:<#${channelId}>`;
    console.info('Slack API検索条件:', searchQuery);

    const searchResult = await fetchSlackApi('search.messages', {
      query: searchQuery,
      sort: 'timestamp',
      sort_dir: 'asc',
      count: 100,
    });

    // Step 2: 各スレッドの打刻データを取得
    const attendanceLogs = {};
    const messages = searchResult.messages?.matches || [];

    for (const message of messages) {
      try {
        const threadData = await fetchThreadReplies(channelId, message.ts);
        const date = new Date(parseFloat(message.ts) * 1000)
          .toISOString().split('T')[0];

        attendanceLogs[date] = {
          date,
          ...threadData,
          breakTime: '1:00' // デフォルトの休憩時間
        };
      } catch (error) {
        console.warn(`スレッドの取得に失敗: ${error.message}`);
      }

      // APIレートリミット対策（1秒間隔）
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 4 & 5: 全日付のデータを作成し、ソート
    const finalLogs = allDates.map(date => 
      attendanceLogs[date] || createEmptyLog(date)
    );

    console.info('最終データ:', finalLogs);
    return finalLogs;

  } catch (error) {
    console.error('データ取得エラー:', error);
    throw new Error(`Slack APIエラー: ${error.message}`);
  }
}
