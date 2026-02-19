import { useEffect } from "react";
import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";

/**
 * 結果発表時のドラマチックなオーバーレイアニメーション
 * 管理者がその場で選んだ正解を大きく表示する
 */
export default function RevealAnimation() {
  const { state, actions } = useGame();
  const question = questions[state.currentQuestionIndex];

  useEffect(() => {
    if (state.phase === "revealing") {
      const timer = setTimeout(() => {
        actions.completeReveal();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, actions]);

  if (state.phase !== "revealing" || !question || !state.revealedAnswer)
    return null;

  const correctChoice = question.choices.find(
    (c) => c.id === state.revealedAnswer
  );
  if (!correctChoice) return null;

  return (
    <div className="reveal-overlay" role="alert" aria-live="assertive">
      <p className="reveal-overlay__label">正解は...</p>
      <div className="reveal-overlay__answer">
        <span className="reveal-overlay__answer-id">{correctChoice.id}</span>
        <span className="reveal-overlay__answer-text">
          {correctChoice.text}
        </span>
      </div>
    </div>
  );
}
