const GAS_URL = import.meta.env.VITE_GAS_URL || "";

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

async function postToGAS(payload) {
  const response = await fetch(GAS_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return response.json();
}

/**
 * チームの回答状況を取得 (問題ごとのシートから)
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
 * 全問題のフォームURLを取得
 * @returns {Object} { questionId: formUrl }
 */
export async function fetchFormUrls() {
  if (!GAS_URL) return {};

  try {
    const data = await postToGAS({ action: "getFormUrls" });
    return data || {};
  } catch (error) {
    console.error("fetchFormUrls API error:", error);
    return {};
  }
}

/**
 * ゲームリセット (全シートのデータクリア)
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

export function isConnected() {
  return !!GAS_URL;
}
