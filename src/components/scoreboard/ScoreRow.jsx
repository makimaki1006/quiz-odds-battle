/**
 * スコアボードの1行: 順位、チーム名、スコア、デルタ表示
 *
 * @param {Object} props
 * @param {number} props.rank - 順位 (1始まり)
 * @param {Object} props.team - { id, name, color }
 * @param {number} props.score - 合計スコア
 * @param {number} props.delta - スコア変動 (0は非表示)
 * @param {boolean} props.showDelta - デルタ表示するか
 */
export default function ScoreRow({ rank, team, score, delta, showDelta }) {
  // 順位に応じたクラス (1-3位は特別カラー)
  const rankClass =
    rank <= 3 ? `score-row__rank score-row__rank--${rank}` : "score-row__rank";

  return (
    <div
      className="score-row"
      role="listitem"
      aria-label={`${rank}位: ${team.name} ${score}点`}
    >
      <span className={rankClass}>{rank}</span>
      <span
        className="score-row__color"
        style={{ backgroundColor: team.color }}
        aria-hidden="true"
      />
      <span className="score-row__name">{team.name}</span>
      <span className="score-row__score">{score}</span>
      {showDelta && delta !== 0 && (
        <span
          className={`score-row__delta ${
            delta > 0 ? "score-row__delta--positive" : "score-row__delta--negative"
          }`}
        >
          {delta > 0 ? `+${delta}` : delta}
        </span>
      )}
    </div>
  );
}
