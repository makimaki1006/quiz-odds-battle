/**
 * Quiz Odds Battle - 自動セットアップスクリプト
 *
 * ============================================
 * 使い方:
 * 1. https://script.google.com にアクセス
 * 2. 「新しいプロジェクト」を作成
 * 3. このファイル (Setup.gs) の内容をすべて貼り付ける
 * 4. 「setupAll」関数を選択して ▶ 実行
 * 5. 権限を承認 (初回のみ)
 * 6. 実行ログにフォームURL・スプレッドシートURL・APIのデプロイ手順が表示される
 * ============================================
 */

/**
 * メインセットアップ関数 - これを実行する
 * スプレッドシート、フォーム、API用コードをすべて自動作成
 */
function setupAll() {
  Logger.log("========================================");
  Logger.log("Quiz Odds Battle セットアップ開始");
  Logger.log("========================================\n");

  // Step 1: スプレッドシート作成
  var ss = SpreadsheetApp.create("Quiz Odds Battle - 回答データ");
  var sheet = ss.getSheets()[0];
  sheet.setName("フォームの回答 1");
  Logger.log("✅ スプレッドシート作成完了");
  Logger.log("   URL: " + ss.getUrl());

  // Step 2: フォーム作成
  var form = FormApp.create("クイズ回答フォーム");
  form.setDescription(
    "チーム名と回答を選択して送信してください。\n" +
    "※ 同じチームで複数回送信した場合、最新の回答が有効になります。"
  );
  form.setConfirmationMessage("回答を送信しました！ ダッシュボードに反映されるまで数秒お待ちください。");
  form.setAllowResponseEdits(false);
  form.setLimitOneResponsePerUser(false);
  form.setRequireLogin(false);

  // フィールド1: チーム名 (プルダウン)
  var teamItem = form.addListItem();
  teamItem.setTitle("チーム名");
  teamItem.setRequired(true);
  teamItem.setChoiceValues(["チーム1", "チーム2", "チーム3", "チーム4", "チーム5"]);

  // フィールド2: 回答 (ラジオボタン)
  var answerItem = form.addMultipleChoiceItem();
  answerItem.setTitle("回答");
  answerItem.setRequired(true);
  answerItem.setChoiceValues(["A", "B", "C", "D"]);

  // フォームの回答先をスプレッドシートにリンク
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  Logger.log("\n✅ Google フォーム作成完了");
  Logger.log("   フォームURL (参加者用): " + form.getPublishedUrl());
  Logger.log("   フォーム編集URL: " + form.getEditUrl());
  Logger.log("   短縮URL: " + form.shortenFormUrl(form.getPublishedUrl()));

  // Step 3: API用コードをスプレッドシートのApps Scriptに追加
  // (注: プログラムからスクリプトを追加する直接的なAPIはないため、手順を案内)
  Logger.log("\n========================================");
  Logger.log("✅ セットアップ完了！");
  Logger.log("========================================");
  Logger.log("");
  Logger.log("📋 次のステップ (API設定):");
  Logger.log("--------------------------------------");
  Logger.log("1. スプレッドシートを開く:");
  Logger.log("   " + ss.getUrl());
  Logger.log("");
  Logger.log("2. メニュー → 拡張機能 → Apps Script");
  Logger.log("");
  Logger.log("3. コード.gs の中身をすべて削除し、");
  Logger.log("   gas/Code.gs の内容を貼り付けて保存");
  Logger.log("");
  Logger.log("4. デプロイ → 新しいデプロイ → ウェブアプリ");
  Logger.log("   - 次のユーザーとして実行: 自分");
  Logger.log("   - アクセスできるユーザー: 全員");
  Logger.log("");
  Logger.log("5. デプロイURLをコピーして .env に設定:");
  Logger.log("   VITE_GAS_URL=https://script.google.com/macros/s/XXXXX/exec");
  Logger.log("");
  Logger.log("📎 参加者に共有するURL:");
  Logger.log("   " + form.getPublishedUrl());
  Logger.log("");

  // Step 4: 設定情報をスプレッドシートの別シートに記録
  var infoSheet = ss.insertSheet("設定情報");
  infoSheet.getRange("A1:B1").setValues([["項目", "値"]]);
  infoSheet.getRange("A2:B7").setValues([
    ["フォームURL (参加者用)", form.getPublishedUrl()],
    ["フォーム編集URL", form.getEditUrl()],
    ["スプレッドシートID", ss.getId()],
    ["スプレッドシートURL", ss.getUrl()],
    ["作成日時", new Date().toLocaleString("ja-JP")],
    ["ステータス", "API未デプロイ (上記の手順4-5を実施してください)"]
  ]);
  infoSheet.autoResizeColumns(1, 2);

  Logger.log("💡 設定情報は「設定情報」シートにも記録しました");

  return {
    spreadsheetUrl: ss.getUrl(),
    spreadsheetId: ss.getId(),
    formUrl: form.getPublishedUrl(),
    formEditUrl: form.getEditUrl()
  };
}

/**
 * テスト用: フォームにダミー回答を送信
 * setupAll 実行後に使用可能
 */
function sendTestResponses() {
  // 設定情報シートからフォームURLを取得
  var files = DriveApp.getFilesByName("Quiz Odds Battle - 回答データ");
  if (!files.hasNext()) {
    Logger.log("❌ スプレッドシートが見つかりません。先に setupAll を実行してください。");
    return;
  }

  var ss = SpreadsheetApp.open(files.next());
  var infoSheet = ss.getSheetByName("設定情報");
  var formUrl = infoSheet.getRange("B3").getValue(); // フォーム編集URL

  // フォームを取得
  var form = FormApp.openByUrl(formUrl);
  var items = form.getItems();
  var teamItem = items[0].asListItem();
  var answerItem = items[1].asMultipleChoiceItem();

  var teams = ["チーム1", "チーム2", "チーム3", "チーム4", "チーム5"];
  var answers = ["A", "B", "C", "D"];

  // 各チームからランダムな回答を送信
  teams.forEach(function(team) {
    if (Math.random() < 0.8) { // 80%の確率で回答
      var response = form.createResponse();
      response.withItemResponse(teamItem.createResponse(team));
      response.withItemResponse(
        answerItem.createResponse(answers[Math.floor(Math.random() * answers.length)])
      );
      response.submit();
      Logger.log("✅ " + team + " のテスト回答を送信しました");
    }
  });

  Logger.log("\n📊 スプレッドシートを確認: " + ss.getUrl());
}
