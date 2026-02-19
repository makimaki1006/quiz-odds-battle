import { useEffect } from "react";
import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";

/**
 * 正解発表時のドラマチックなオーバーレイアニメーション
 * phase === "revealing" のときフルスクリーンオーバーレイを表示し、
 * 2秒後に COMPLETE_REVEAL をディスパッチする
 */
export default function RevealAnimation() {
  const { state, actions } = useGame();
  const question = questions[state.currentQuestionIndex];

  // revealing フェーズ開始時に2秒後に完了へ遷移
  useEffect(() => {
    if (state.phase === "revealing") {
      const timer = setTimeout(() => {
        actions.completeReveal();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.phase, actions]);

  // revealing フェーズ以外は非表示
  if (state.phase !== "revealing" || !question) return null;

  // 正解の選択肢を取得
  const correctChoice = question.choices.find((c) => c.id === question.answer);
  if (!correctChoice) return null;

  return (
    <div className="reveal-overlay" role="alert" aria-live="assertive">
      <p className="reveal-overlay__label">正解は...</p>
      <div className="reveal-overlay__answer">
        <span className="reveal-overlay__answer-id">{correctChoice.id}</span>
        <span className="reveal-overlay__answer-text">{correctChoice.text}</span>
      </div>
    </div>
  );
}
