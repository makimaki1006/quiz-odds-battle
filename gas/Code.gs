/**
 * Quiz Odds Battle - Google Apps Script API
 * 1問 = 1フォーム = 1シート の構成
 */

// ===== 設定 =====
var SPREADSHEET_ID = "1ONRuKUJhvuoHamicV5mgDJaFHUFpZxVSnfBRjCmmJlU";

var TEAM_COLUMN = "チーム名";
var ANSWER_COLUMN = "回答";

var TEAM_MAP = {
  "チーム1": 1, "チーム2": 2, "チーム3": 3,
  "チーム4": 4, "チーム5": 5
};

// 問題データ (React側の questions.js と一致させる)
var QUESTIONS = [
  { id: 1, text: "日本で一番高い山は？", choices: ["A:富士山", "B:北岳", "C:奥穂高岳", "D:間ノ岳"] },
  { id: 2, text: "太陽系で一番大きい惑星は？", choices: ["A:土星", "B:木星", "C:天王星", "D:海王星"] },
  { id: 3, text: "日本の首都が東京に移されたのは何年？", choices: ["A:1853年", "B:1868年", "C:1872年", "D:1889年"] },
  { id: 4, text: "水の化学式はどれ？", choices: ["A:CO2", "B:NaCl", "C:H2O", "D:O2"] },
  { id: 5, text: "「吾輩は猫である」の作者は？", choices: ["A:芥川龍之介", "B:太宰治", "C:夏目漱石", "D:川端康成"] }
];

var TEAM_NAMES = ["チーム1", "チーム2", "チーム3", "チーム4", "チーム5"];

// ===== メインハンドラ =====

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    switch (data.action) {
      case "getAnswers":
        return jsonResponse(getAnswers(data.questionId));
      case "getFormUrls":
        return jsonResponse(getFormUrls());
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
    formUrls: getFormUrls()
  });
}

// ===== API関数 =====

/**
 * 指定された問題の回答を取得
 * シート「Q{questionId}」から読み取る
 */
function getAnswers(questionId) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheetName = "Q" + questionId;
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { answers: {}, error: "Sheet '" + sheetName + "' not found" };
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return { answers: {} };
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var teamColIdx = headers.indexOf(TEAM_COLUMN);
  var answerColIdx = headers.indexOf(ANSWER_COLUMN);

  if (teamColIdx === -1 || answerColIdx === -1) {
    return {
      answers: {},
      error: "Column not found. Headers: " + headers.join(", ")
    };
  }

  var data = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
  var answers = {};

  for (var i = 0; i < data.length; i++) {
    var teamName = String(data[i][teamColIdx]).trim();
    var answer = String(data[i][answerColIdx]).trim();
    var teamId = TEAM_MAP[teamName];
    if (teamId && answer) {
      answers[teamId] = answer;
    }
  }

  return { answers: answers };
}

/**
 * 全問題のフォームURLを返す
 */
function getFormUrls() {
  var props = PropertiesService.getScriptProperties();
  var urls = {};
  for (var i = 0; i < QUESTIONS.length; i++) {
    var qId = QUESTIONS[i].id;
    var url = props.getProperty("formUrl_" + qId);
    if (url) {
      urls[qId] = url;
    }
  }
  return urls;
}

/**
 * ゲームリセット: 全シートの回答データをクリア (ヘッダーは残す)
 */
function resetGame() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var cleared = [];

  for (var i = 0; i < QUESTIONS.length; i++) {
    var sheetName = "Q" + QUESTIONS[i].id;
    var sheet = ss.getSheetByName(sheetName);
    if (sheet && sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      cleared.push(sheetName);
    }
  }

  return { success: true, cleared: cleared };
}

// ===== セットアップ: 全フォーム一括作成 =====

/**
 * 全問題のフォームを一括作成
 * GASエディタで「setupAllForms」を選択して ▶ 実行
 */
function setupAllForms() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var props = PropertiesService.getScriptProperties();

  Logger.log("========================================");
  Logger.log("Quiz Odds Battle - フォーム一括作成");
  Logger.log("========================================\n");

  for (var i = 0; i < QUESTIONS.length; i++) {
    var q = QUESTIONS[i];
    var sheetName = "Q" + q.id;

    // フォーム作成
    var form = FormApp.create("Q" + q.id + ". " + q.text);
    form.setDescription(
      "【Q" + q.id + "】" + q.text + "\n\n" +
      q.choices.join("\n") + "\n\n" +
      "チーム名と回答 (A/B/C/D) を選んで送信してください。"
    );
    form.setConfirmationMessage("回答を送信しました！");
    form.setAllowResponseEdits(false);
    form.setLimitOneResponsePerUser(false);

    // チーム名 (プルダウン)
    var teamItem = form.addListItem();
    teamItem.setTitle("チーム名");
    teamItem.setRequired(true);
    teamItem.setChoiceValues(TEAM_NAMES);

    // 回答 (ラジオボタン)
    var answerItem = form.addMultipleChoiceItem();
    answerItem.setTitle("回答");
    answerItem.setRequired(true);
    answerItem.setChoiceValues(["A", "B", "C", "D"]);

    // スプレッドシートにリンク
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // フォームが作成したシートをリネーム
    SpreadsheetApp.flush();
    Utilities.sleep(2000);

    // 最後に追加されたシート (フォーム連携で自動作成されたもの) を探す
    var sheets = ss.getSheets();
    for (var j = 0; j < sheets.length; j++) {
      var name = sheets[j].getName();
      if (name.indexOf("フォームの回答") !== -1) {
        // まだリネームされていないシートを見つけた
        var alreadyRenamed = false;
        for (var k = 0; k < QUESTIONS.length; k++) {
          if (name === "Q" + QUESTIONS[k].id) {
            alreadyRenamed = true;
            break;
          }
        }
        if (!alreadyRenamed) {
          sheets[j].setName(sheetName);
          break;
        }
      }
    }

    // フォームURLを保存
    props.setProperty("formUrl_" + q.id, form.getPublishedUrl());

    Logger.log("✅ Q" + q.id + " 作成完了");
    Logger.log("   問題: " + q.text);
    Logger.log("   フォーム: " + form.getPublishedUrl());
    Logger.log("   シート: " + sheetName);
    Logger.log("");
  }

  Logger.log("========================================");
  Logger.log("✅ 全 " + QUESTIONS.length + " 問のフォーム作成完了！");
  Logger.log("========================================");
  Logger.log("");
  Logger.log("👉 次のステップ:");
  Logger.log("   デプロイ → 新しいデプロイ → ウェブアプリ → 全員 → デプロイ");
  Logger.log("   デプロイURLを React の .env に VITE_GAS_URL として設定");
}

// ===== ヘルパー =====

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
