/**
 * 各選択肢のオッズを計算する
 * @param {Array} choices - 選択肢配列
 * @param {Object} teamAnswers - { teamId: choiceId } のマップ
 * @param {number} totalTeams - 全チーム数
 * @returns {Object} { choiceId: odds } のマップ
 */
export function calculateOdds(choices, teamAnswers, totalTeams) {
  const counts = {};
  choices.forEach((c) => {
    counts[c.id] = 0;
  });

  Object.values(teamAnswers).forEach((choiceId) => {
    if (counts[choiceId] !== undefined) counts[choiceId]++;
  });

  const odds = {};
  choices.forEach((c) => {
    if (counts[c.id] === 0) {
      // 誰も選んでいない選択肢は大穴
      odds[c.id] = 10.0;
    } else {
      // チーム数 / 選択数 で計算、最低1.2倍
      odds[c.id] = Math.max(
        1.2,
        parseFloat((totalTeams / counts[c.id]).toFixed(1))
      );
    }
  });

  return odds;
}

/**
 * オッズのランクを返す (表示用)
 * @param {number} odds
 * @returns {"favorite"|"normal"|"longshot"}
 */
export function getOddsRank(odds) {
  if (odds <= 2.0) return "favorite";
  if (odds >= 5.0) return "longshot";
  return "normal";
}
