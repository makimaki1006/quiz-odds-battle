/**
 * 正解発表後のスコアを計算する
 * @param {Object} currentScores - { teamId: score }
 * @param {Object} teamAnswers - { teamId: choiceId }
 * @param {string} correctAnswer - 正解の choiceId
 * @param {Object} odds - { choiceId: odds }
 * @returns {Object} { teamId: newScore }
 */
export function calculateScores(currentScores, teamAnswers, correctAnswer, odds) {
  const newScores = { ...currentScores };

  Object.entries(teamAnswers).forEach(([teamId, choiceId]) => {
    if (choiceId === correctAnswer) {
      // 正解: オッズ x 100pt
      newScores[teamId] = (newScores[teamId] || 0) + Math.round(odds[choiceId] * 100);
    } else {
      // 不正解: -100pt
      newScores[teamId] = (newScores[teamId] || 0) - 100;
    }
  });

  return newScores;
}

/**
 * チームのスコア変動を計算する
 * @param {string|number} teamId - チームID
 * @param {Object} teamAnswers - { teamId: choiceId }
 * @param {string} correctAnswer - 正解の choiceId
 * @param {Object} odds - { choiceId: odds }
 * @returns {number} スコア変動値
 */
export function getScoreDelta(teamId, teamAnswers, correctAnswer, odds) {
  const choiceId = teamAnswers[teamId];
  if (!choiceId) return 0;
  if (choiceId === correctAnswer) return Math.round(odds[choiceId] * 100);
  return -100;
}
