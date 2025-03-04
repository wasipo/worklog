import { calculateWorkingHours, toJstISOString, getSlackSearchRange, devLog, devError } from '../utils/timeUtils';

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

  // メッセージを時系列でソート（昇順）
  const sortedMessages = result.messages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));
  
  // ソート後の最初と最後のメッセージを取得
  const firstMessage = sortedMessages[0];
  const lastMessage = sortedMessages[sortedMessages.length - 1];

  // スレッド内の全メッセージを対象に休憩メッセージをチェック
  const hasBreakMessage = sortedMessages.some(msg => /休憩/.test(msg.text || ''));

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

// 指定した月の全日付を生成する関数（UTC基準）
function generateMonthDates(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const dates = [];
  
  // 月の日数を正確にUTCで取得
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    // UTCの00:00:00として日付を生成
    const utcDate = new Date(Date.UTC(year, month - 1, day));
    dates.push(utcDate.toISOString().split('T')[0]);
  }
  
  devLog('生成された日付一覧（UTC基準）:', dates);
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

    // Step 2: 検索期間の設定（JST基準でUTCに変換）
    const { afterDate, beforeDate } = getSlackSearchRange(yearMonth);
    devLog('検索期間（UTC）:', { afterDate, beforeDate });

    // Step 3: メッセージの検索（チャンネル名を使用）
    const searchQuery = `"${searchKeyword}" after:${afterDate} before:${beforeDate} in:#${channelName}`;
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

    // 処理済みスレッドのTSを記録するSetを準備
    const processedThreadTsSet = new Set();

    for (const message of messages) {
      try {
        // スレッドのrootを特定（thread_tsがあればそれ、なければmessage.ts）
        const rootTs = message.thread_ts || message.ts;

        // すでに処理済みならスキップする
        if (processedThreadTsSet.has(rootTs)) {
          devLog(`スレッド重複検知、スキップ: ${rootTs}`);
          continue;
        }
        processedThreadTsSet.add(rootTs);

        // スレッドを取得する
        const threadData = await fetchThreadReplies(channelId, rootTs);

        // JSTの日付キー生成
        const dateUTC = new Date(parseFloat(rootTs) * 1000);
        const dateJSTString = toJstISOString(dateUTC);
        const dateJST = dateJSTString.split('T')[0];

        attendanceLogs[dateJST] = {
          date: dateJST,
          ...threadData,
          workingHours: calculateWorkingHours(
            threadData.clockIn,
            threadData.clockOut,
            threadData.breakTime
          )
        };

        devLog(`スレッド取得成功: ${dateJST}`, attendanceLogs[dateJST]);
      } catch (error) {
        devError(`スレッドの取得に失敗: ${error.message}`);
      }

      // APIレートリミット対策（1秒間隔）
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Step 5: 全日付のデータを作成し、ソート
    let finalLogs = allDates.map(date => 
      attendanceLogs[date] || createEmptyLog(date)
    );

    // 指定した年月のログのみにフィルタリング
    finalLogs = finalLogs.filter(log => log.date.startsWith(yearMonth));

    devLog('最終データ:', finalLogs);
    return finalLogs;

  } catch (error) {
    devError('データ取得エラー:', error);
    throw new Error(`Slack APIエラー: ${error.message}`);
  }
}
