import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";

/**
 * 管理者用操作パネル
 * URL に ?admin=true がある場合のみ表示
 */
export default function AdminPanel() {
  const { state, actions } = useGame();

  // URLパラメータで管理者モードを判定
  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";
  if (!isAdmin) return null;

  const isFirstQuestion = state.currentQuestionIndex === 0;
  const isLastQuestion = state.currentQuestionIndex >= questions.length - 1;

  // フェーズに応じた日本語ラベル
  const phaseLabels = {
    waiting: "待機中",
    answering: "回答受付中",
    revealing: "正解発表中",
    revealed: "発表完了",
  };

  /** 正解発表: REVEAL_ANSWER -> 2秒後 COMPLETE_REVEAL */
  const handleReveal = () => {
    actions.revealAnswer();
    setTimeout(() => {
      actions.completeReveal();
    }, 2000);
  };

  /** リセット: 確認ダイアログ付き */
  const handleReset = () => {
    if (window.confirm("ゲームをリセットしますか？ スコアもすべて初期化されます。")) {
      actions.resetGame();
    }
  };

  return (
    <div className="admin-panel" role="region" aria-label="管理者パネル">
      <div className="admin-panel__header">
        <span className="admin-panel__title">Admin Panel</span>
        <span className="admin-panel__info">
          Q.{state.currentQuestionIndex + 1} / {questions.length} --{" "}
          <span className="admin-panel__phase">{phaseLabels[state.phase]}</span>
        </span>
      </div>

      <div className="admin-panel__controls">
        {/* 前の問題 */}
        <button
          className="admin-panel__btn admin-panel__btn--prev"
          onClick={actions.prevQuestion}
          disabled={isFirstQuestion || state.phase !== "waiting"}
          aria-label="前の問題に戻る"
        >
          &#9664; 前の問題
        </button>

        {/* 回答開始 */}
        {state.phase === "waiting" && (
          <button
            className="admin-panel__btn admin-panel__btn--start"
            onClick={actions.startQuestion}
            aria-label="回答を開始する"
          >
            &#9654; 回答開始
          </button>
        )}

        {/* 正解発表 */}
        <button
          className="admin-panel__btn admin-panel__btn--reveal"
          onClick={handleReveal}
          disabled={state.phase !== "answering"}
          aria-label="正解を発表する"
        >
          &#127919; 正解発表
        </button>

        {/* 次の問題 */}
        <button
          className="admin-panel__btn admin-panel__btn--next"
          onClick={actions.nextQuestion}
          disabled={isLastQuestion || state.phase !== "revealed"}
          aria-label="次の問題へ進む"
        >
          次の問題 &#9654;
        </button>

        {/* リセット */}
        <button
          className="admin-panel__btn admin-panel__btn--reset"
          onClick={handleReset}
          aria-label="ゲームをリセットする"
        >
          &#128260; リセット
        </button>
      </div>
    </div>
  );
}
