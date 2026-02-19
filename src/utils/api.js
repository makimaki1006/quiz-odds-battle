const GAS_URL = import.meta.env.VITE_GAS_URL || "";

/**
 * モックデータ: チームの回答をシミュレート
 * @param {number} questionId - 問題ID
 * @param {Array} choices - 選択肢配列
 * @param {Array} teams - チーム配列
 * @returns {Object} { teamId: choiceId } のマップ
 */
function generateMockAnswers(questionId, choices, teams) {
  const answers = {};
  teams.forEach((team) => {
    // ランダムに70%の確率で回答済み
    if (Math.random() < 0.7) {
      const randomChoice = choices[Math.floor(Math.random() * choices.length)];
      answers[team.id] = randomChoice.id;
    }
  });
  return answers;
}

/**
 * チームの回答状況を取得
 * GAS URLが未設定の場合はモックデータを返す
 * @param {number} questionId - 問題ID
 * @param {Array} choices - 選択肢配列
 * @param {Array} teams - チーム配列
 * @returns {Promise<Object>} { teamId: choiceId } のマップ
 */
export async function fetchTeamAnswers(questionId, choices, teams) {
  if (!GAS_URL) {
    // モックモード: 300msの遅延でシミュレート
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(generateMockAnswers(questionId, choices, teams));
      }, 300);
    });
  }

  try {
    const response = await fetch(GAS_URL, {
      method: "POST",
      body: JSON.stringify({ action: "getAnswers", questionId }),
    });
    const data = await response.json();
    return data.answers || {};
  } catch (error) {
    console.error("API fetch error:", error);
    return {};
  }
}
