/**
 * Quiz Odds Battle - Google Apps Script API
 *
 * スプレッドシート構成:
 * シート「回答」: timestamp | teamId | questionId | choiceId
 *
 * デプロイ手順:
 * 1. Google スプレッドシートを作成
 * 2. 拡張機能 → Apps Script
 * 3. このコードを貼り付け
 * 4. デプロイ → ウェブアプリ → 全員がアクセス可能
 */

const SHEET_NAME = "回答";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    if (data.action === "getAnswers") {
      return getAnswers(data.questionId);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ error: "Unknown action" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getAnswers(questionId) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const answers = {};
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const qId = row[headers.indexOf("questionId")];
    if (String(qId) === String(questionId)) {
      const teamId = row[headers.indexOf("teamId")];
      const choiceId = row[headers.indexOf("choiceId")];
      answers[teamId] = choiceId;
    }
  }

  return ContentService.createTextOutput(
    JSON.stringify({ answers })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "Quiz Odds Battle API" })
  ).setMimeType(ContentService.MimeType.JSON);
}
