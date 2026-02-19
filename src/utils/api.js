const GAS_URL = import.meta.env.VITE_GAS_URL || "";

/**
 * モックデータ: チームの回答をシミュレート
 */
function generateMockAnswers(questionId, choices, teams) {
  const answers = {};
  teams.forEach((team) => {
    if (Math.random() < 0.7) {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      answers[team.id] = randomChoice.id;
    }
  });
  return answers;
}

/**
 * GAS APIにPOSTリクエストを送信
 */
async function postToGAS(payload) {
  const response = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

/**
 * 問題の回答受付を開始する (GASに通知)
 * GAS側で現在のスプレッドシート行を記録し、以降の回答をこの問題に紐付ける
 */
export async function startQuestionAPI(questionId) {
  if (!GAS_URL) return { success: true, mock: true };

  try {
    return await postToGAS({ action: "startQuestion", questionId });
  } catch (error) {
    console.error("startQuestion API error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * チームの回答状況を取得
 * GAS URLが未設定の場合はモックデータを返す
 */
export async function fetchTeamAnswers(questionId, choices, teams) {
  if (!GAS_URL) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAnswers(questionId, choices, teams));
      }, 300);
    });
  }

  try {
    const data = await postToGAS({ action: "getAnswers", questionId });
    return data.answers || {};
  } catch (error) {
    console.error("fetchTeamAnswers API error:", error);
    return {};
  }
}

/**
 * ゲームをリセット (GAS側の状態もクリア)
 */
export async function resetGameAPI() {
  if (!GAS_URL) return { success: true, mock: true };

  try {
    return await postToGAS({ action: "resetGame" });
  } catch (error) {
    console.error("resetGame API error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * GAS接続状態を確認
 */
export function isConnected() {
  return !!GAS_URL;
}
