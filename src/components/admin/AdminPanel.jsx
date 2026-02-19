import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";
import { startQuestionAPI, resetGameAPI, isConnected } from "../../utils/api";

/**
 * 管理者用操作パネル
 * URL に ?admin=true がある場合のみ表示
 */
export default function AdminPanel() {
  const { state, actions } = useGame();

  const isAdmin = new URLSearchParams(window.location.search).get("admin") === "true";
  if (!isAdmin) return null;

  const isFirstQuestion = state.currentQuestionIndex === 0;
  const isLastQuestion = state.currentQuestionIndex >= questions.length - 1;
  const currentQuestion = questions[state.currentQuestionIndex];

  const phaseLabels = {
    waiting: "待機中",
    answering: "回答受付中",
    revealing: "正解発表中",
    revealed: "発表完了",
  };

  /** 回答開始: GASに通知してからローカル状態を更新 */
  const handleStart = async () => {
    await startQuestionAPI(currentQuestion.id);
    actions.startQuestion();
  };

  /** 正解発表: REVEAL_ANSWER -> 2秒後 COMPLETE_REVEAL */
  const handleReveal = () => {
    actions.revealAnswer();
    setTimeout(() => {
      actions.completeReveal();
    }, 2000);
  };

  /** リセット: 確認ダイアログ付き、GAS側もリセット */
  const handleReset = async () => {
    if (window.confirm("ゲームをリセットしますか？ スコアもすべて初期化されます。")) {
      await resetGameAPI();
      actions.resetGame();
    }
  };

  return (
    <div className="admin-panel" role="region" aria-label="管理者パネル">
      <div className="admin-panel__header">
        <span className="admin-panel__title">Admin Panel</span>
        <span className="admin-panel__status">
          {isConnected() ? "🟢 GAS接続" : "🟡 モック"}
        </span>
        <span className="admin-panel__info">
          Q.{state.currentQuestionIndex + 1} / {questions.length} --{" "}
          <span className="admin-panel__phase">{phaseLabels[state.phase]}</span>
        </span>
      </div>

      <div className="admin-panel__controls">
        <button
          className="admin-panel__btn admin-panel__btn--prev"
          onClick={actions.prevQuestion}
          disabled={isFirstQuestion || state.phase !== "waiting"}
          aria-label="前の問題に戻る"
        >
          &#9664; 前の問題
        </button>

        {state.phase === "waiting" && (
          <button
            className="admin-panel__btn admin-panel__btn--start"
            onClick={handleStart}
            aria-label="回答を開始する"
          >
            &#9654; 回答開始
          </button>
        )}

        <button
          className="admin-panel__btn admin-panel__btn--reveal"
          onClick={handleReveal}
          disabled={state.phase !== "answering"}
          aria-label="正解を発表する"
        >
          &#127919; 正解発表
        </button>

        <button
          className="admin-panel__btn admin-panel__btn--next"
          onClick={actions.nextQuestion}
          disabled={isLastQuestion || state.phase !== "revealed"}
          aria-label="次の問題へ進む"
        >
          次の問題 &#9654;
        </button>

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
