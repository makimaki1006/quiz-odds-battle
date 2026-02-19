import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";
import OddsCard from "./OddsCard";

/**
 * オッズボード: 4つのOddsCardを2x2グリッドで表示
 * phase が "answering", "revealing", "revealed" のとき表示
 */
export default function OddsBoard() {
  const { state } = useGame();
  const question = questions[state.currentQuestionIndex];

  if (!question) return null;

  // waiting フェーズでは待機画面を表示
  if (state.phase === "waiting") {
    return (
      <div className="waiting-screen">
        <p className="waiting-screen__text">
          ゲーム開始を待っています...
        </p>
      </div>
    );
  }

  const isRevealed = state.phase === "revealing" || state.phase === "revealed";

  return (
    <div className="odds-board" role="region" aria-label="オッズボード">
      {question.choices.map((choice) => (
        <OddsCard
          key={choice.id}
          choice={choice}
          odds={state.odds[choice.id]}
          revealedAnswer={state.revealedAnswer}
          isRevealed={isRevealed}
        />
      ))}
    </div>
  );
}
