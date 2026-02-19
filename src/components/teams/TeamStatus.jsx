import { useGame } from "../../hooks/useGameState";
import { teams } from "../../data/questions";
import TeamBadge from "./TeamBadge";

/**
 * 全チームの回答状況を一覧表示するコンポーネント
 */
export default function TeamStatus() {
  const { state } = useGame();

  return (
    <section className="team-status" aria-label="チーム回答状況">
      <h3 className="team-status__title">回答状況</h3>
      <div className="team-status__list" role="list">
        {teams.map((team) => (
          <TeamBadge
            key={team.id}
            team={team}
            hasAnswered={state.teamAnswers[team.id] !== undefined}
          />
        ))}
      </div>
    </section>
  );
}
