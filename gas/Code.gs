/**
 * Quiz Odds Battle - Google Apps Script API
 *
 * ============================
 * セットアップ手順
 * ============================
 * 1. Google スプレッドシートを新規作成
 * 2. Google フォームを新規作成 (詳細は gas/SETUP.md 参照)
 *    - フィールド1: 「チーム名」(プルダウン) → チーム1〜チーム5
 *    - フィールド2: 「回答」(ラジオボタン) → A, B, C, D
 * 3. フォームの「回答」タブ → スプレッドシートにリンク → 上記スプレッドシートを選択
 * 4. スプレッドシートで 拡張機能 → Apps Script → このコードを貼り付け
 * 5. デプロイ → ウェブアプリ → アクセスできるユーザー: 全員 → デプロイ
 * 6. 表示されたURLを React の .env に VITE_GAS_URL として設定
 *
 * ============================
 * API仕様
 * ============================
 * POST リクエスト (body: JSON文字列)
 *
 * action: "startQuestion"
 *   - questionId: number
 *   - 現在のスプレッドシート行数を記録し、以降の回答をこの問題に紐付ける
 *
 * action: "getAnswers"
 *   - questionId: number
 *   - startQuestion 以降に追加された行から回答を取得
 *   - 戻り値: { answers: { teamId: choiceId } }
 *
 * action: "resetGame"
 *   - 全問題の開始行をリセット
 */

// ===== 設定 =====
// フォームのスプレッドシートに自動作成されるシート名
// (フォーム連携すると「フォームの回答 1」等になる。必要に応じて変更)
var SHEET_NAME = "フォームの回答 1";

// フォームの列ヘッダー名 (フォームの質問テキストと一致させる)
var TEAM_COLUMN = "チーム名";
var ANSWER_COLUMN = "回答";

// チーム名 → チームID のマッピング
var TEAM_MAP = {
  "チーム1": 1,
  "チーム2": 2,
  "チーム3": 3,
  "チーム4": 4,
  "チーム5": 5
};

// ===== メインハンドラ =====

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    switch (data.action) {
      case "startQuestion":
        return jsonResponse(startQuestion(data.questionId));
      case "getAnswers":
        return jsonResponse(getAnswers(data.questionId));
      case "resetGame":
        return jsonResponse(resetGame());
      default:
        return jsonResponse({ error: "Unknown action: " + data.action });
    }
  } catch (err) {
    return jsonResponse({ error: err.message });
  }
}

function doGet() {
  return jsonResponse({
    status: "ok",
    message: "Quiz Odds Battle API",
    currentQuestion: getCurrentQuestion()
  });
}

// ===== API関数 =====

/**
 * 問題の回答受付を開始する
 * 現在のスプレッドシート最終行を記録し、以降の行をこの問題の回答とみなす
 */
function startQuestion(questionId) {
  var sheet = getSheet();
  var lastRow = sheet.getLastRow();

  var props = PropertiesService.getScriptProperties();
  props.setProperty("q_" + questionId + "_start", String(lastRow + 1));
  props.setProperty("currentQuestion", String(questionId));

  return {
    success: true,
    questionId: questionId,
    startRow: lastRow + 1
  };
}

/**
 * 指定された問題の回答を取得する
 * startQuestion で記録した行以降の回答を返す
 */
function getAnswers(questionId) {
  var props = PropertiesService.getScriptProperties();
  var startRow = parseInt(props.getProperty("q_" + questionId + "_start") || "0", 10);

  if (startRow === 0) {
    return { answers: {}, message: "Question not started yet" };
  }

  var sheet = getSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow < startRow) {
    return { answers: {} };
  }

  // ヘッダー行を読む
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var teamColIdx = headers.indexOf(TEAM_COLUMN);
  var answerColIdx = headers.indexOf(ANSWER_COLUMN);

  if (teamColIdx === -1 || answerColIdx === -1) {
    return {
      answers: {},
      error: "Column not found. Expected: '" + TEAM_COLUMN + "', '" + ANSWER_COLUMN + "'. Found: " + headers.join(", ")
    };
  }

  // 開始行〜最終行のデータを取得
  var numRows = lastRow - startRow + 1;
  var data = sheet.getRange(startRow, 1, numRows, sheet.getLastColumn()).getValues();

  var answers = {};
  for (var i = 0; i < data.length; i++) {
    var teamName = String(data[i][teamColIdx]).trim();
    var answer = String(data[i][answerColIdx]).trim();
    var teamId = TEAM_MAP[teamName];

    if (teamId && answer) {
      // 同じチームが複数回答した場合、最新の回答で上書き
      answers[teamId] = answer;
    }
  }

  return { answers: answers };
}

/**
 * ゲームをリセット (全問題の開始行情報をクリア)
 */
function resetGame() {
  var props = PropertiesService.getScriptProperties();
  props.deleteAllProperties();
  return { success: true, message: "Game reset" };
}

// ===== ヘルパー関数 =====

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    // シート名が違う場合、最初のシートを使用
    sheet = ss.getSheets()[0];
    Logger.log("Sheet '" + SHEET_NAME + "' not found. Using first sheet: " + sheet.getName());
  }

  return sheet;
}

function getCurrentQuestion() {
  var props = PropertiesService.getScriptProperties();
  return parseInt(props.getProperty("currentQuestion") || "0", 10);
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
