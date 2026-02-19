import { useGame } from "../../hooks/useGameState";
import { teams, questions } from "../../data/questions";
import { getScoreDelta } from "../../utils/scoring";
import ScoreRow from "./ScoreRow";

/**
 * チームスコアをランキング順で表示するコンポーネント
 */
export default function Scoreboard() {
  const { state } = useGame();
  const question = questions[state.currentQuestionIndex];

  // スコア降順でソート
  const sortedTeams = [...teams].sort((a, b) => {
    const scoreA = state.scores[a.id] || 0;
    const scoreB = state.scores[b.id] || 0;
    return scoreB - scoreA;
  });

  // revealed フェーズでデルタ表示
  const showDelta = state.phase === "revealed" && question;

  return (
    <section className="scoreboard" aria-label="スコアボード">
      <h3 className="scoreboard__title">スコアランキング</h3>
      <div className="scoreboard__list" role="list">
        {sortedTeams.map((team, index) => {
          const score = state.scores[team.id] || 0;
          const delta = showDelta
            ? getScoreDelta(team.id, state.teamAnswers, question.answer, state.odds)
            : 0;

          return (
            <ScoreRow
              key={team.id}
              rank={index + 1}
              team={team}
              score={score}
              delta={delta}
              showDelta={!!showDelta}
            />
          );
        })}
      </div>
    </section>
  );
}
