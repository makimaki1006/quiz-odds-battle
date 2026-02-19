/**
 * チームバッジ: チーム名、カラー、回答状況を表示
 *
 * @param {Object} props
 * @param {Object} props.team - { id, name, color }
 * @param {boolean} props.hasAnswered - 回答済みか
 */
export default function TeamBadge({ team, hasAnswered }) {
  return (
    <div
      className="team-badge"
      role="listitem"
      aria-label={`${team.name}: ${hasAnswered ? "回答済み" : "未回答"}`}
    >
      <span
        className="team-badge__color"
        style={{ backgroundColor: team.color }}
        aria-hidden="true"
      />
      <span className="team-badge__name">{team.name}</span>
      <span
        className={`team-badge__status ${
          hasAnswered ? "team-badge__status--answered" : "team-badge__status--waiting"
        }`}
        aria-hidden="true"
      >
        {hasAnswered ? "\u2713" : "..."}
      </span>
    </div>
  );
}
