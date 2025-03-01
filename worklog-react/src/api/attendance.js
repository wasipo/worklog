import { calculateWorkingHours, toJstISOString, devLog, devError } from '../utils/timeUtils';

// 検索用の日付範囲をUTC基準で計算する関数
function getSlackApiDateRange(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  
  // 対象月の前日をUTCで取得
  const afterDate = new Date(Date.UTC(year, month - 1, 1));
  afterDate.setUTCDate(afterDate.getUTCDate() - 1);
  
  // 翌月の1日をUTCで取得
  const beforeDate = new Date(Date.UTC(year, month, 1));
  
  return {
    afterDateStr: afterDate.toISOString().split('T')[0],
    beforeDateStr: beforeDate.toISOString().split('T')[0],
  };
}

// Slack API用のクライアント設定
async function fetchSlackApi(endpoint, params) {
  const token = import.meta.env.VITE_SLACK_TOKEN;
  
  devLog(`Slack API リクエスト: ${endpoint}`, params);
  
  // クエリパラメータをURLに追加
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
    devError('Slack API エラーレスポンス:', data);
    throw new Error(`Slack API Error: ${data.error || '不明なエラー'}`);
  }

  if (endpoint === 'search.messages' && (!data.messages || !Array.isArray(data.messages.matches))) {
    devError('予期しないレスポンス形式:', data);
    throw new Error('検索結果が正しい形式ではありません');
  }

  devLog(`Slack API レスポンス: ${endpoint}`, data);
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

  // スレッド内の全メッセージを対象に休憩メッセージをチェック
  const hasBreakMessage = result.messages.some(msg => /休憩/.test(msg.text || ''));

  // タイムスタンプをDateオブジェクトに変換し、JSTのISO文字列に変換
  const clockIn = toJstISOString(new Date(parseFloat(firstMessage.ts) * 1000));
  const clockOut = toJstISOString(new Date(parseFloat(lastMessage.ts) * 1000));

  return {
    clockIn,
    clockOut,
    breakTime: '1:00',
    userId: firstMessage.user,
    hasBreakMessage
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
    userId: '---',
    workingHours: '---',
    hasBreakMessage: false
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

    const clockInStr = toJstISOString(clockIn);
    const clockOutStr = toJstISOString(clockOut);
    const breakTime = '1:00';

    return {
      date,
      clockIn: clockInStr,
      clockOut: clockOutStr,
      breakTime,
      workingHours: calculateWorkingHours(clockInStr, clockOutStr, breakTime),
      userId: 'U01ABC123DE',
      hasBreakMessage: Math.random() > 0.5
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
    const channelName = import.meta.env.VITE_SLACK_CHANNEL_NAME;
    const searchKeyword = import.meta.env.VITE_SLACK_SEARCH_KEYWORD || '開始します';

    // テストモードの場合はモックデータを返す
    if (isTestMode) {
      devLog(`テストモード: ${yearMonth}のモックデータを使用します`);
      return createMockLogs(yearMonth);
    }

    // 本番モードで必要な設定が不足している場合
    if (!token || !channelId || !channelName) {
      throw new Error('Slack APIの設定が不足しています。環境変数を確認してください。');
    }

    // Step 1: 月の全日付を生成
    const allDates = generateMonthDates(yearMonth);
    devLog('生成された日付一覧:', allDates);

    // Step 2: 検索期間の設定（UTC基準で計算）
    const { afterDateStr, beforeDateStr } = getSlackApiDateRange(yearMonth);
    devLog('検索期間:', { afterDateStr, beforeDateStr });

    // Step 3: メッセージの検索（チャンネル名を使用）
    const searchQuery = `"${searchKeyword}" after:${afterDateStr} before:${beforeDateStr} in:#${channelName}`;
    devLog('Slack API検索条件:', searchQuery);

    const searchResult = await fetchSlackApi('search.messages', {
      query: searchQuery,
      sort: 'timestamp',
      sort_dir: 'asc',
      count: 100,
    });

    // Step 4: 各スレッドの打刻データを取得
    const attendanceLogs = {};
    const messages = searchResult.messages?.matches || [];

    for (const message of messages) {
      try {
        const threadData = await fetchThreadReplies(channelId, message.ts);
        // メッセージのタイムスタンプからJSTの日付を取得
        const messageDate = new Date(parseFloat(message.ts) * 1000);
        const date = toJstISOString(messageDate).split('T')[0];

        // 稼働時間を計算して追加
        attendanceLogs[date] = {
          date,
          ...threadData,
          workingHours: calculateWorkingHours(threadData.clockIn, threadData.clockOut, threadData.breakTime)
        };
      } catch (error) {
        devError(`スレッドの取得に失敗: ${error.message}`);
      }

      // APIレートリミット対策（1秒間隔）
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 5: 全日付のデータを作成し、ソート
    const finalLogs = allDates.map(date => 
      attendanceLogs[date] || createEmptyLog(date)
    );

    devLog('最終データ:', finalLogs);
    return finalLogs;

  } catch (error) {
    devError('データ取得エラー:', error);
    throw new Error(`Slack APIエラー: ${error.message}`);
  }
}
