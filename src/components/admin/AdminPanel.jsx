import { useState } from "react";
import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";
import { startQuestionAPI, resetGameAPI, isConnected } from "../../utils/api";

/**
 * 管理者用操作パネル
 * URL に ?admin=true がある場合のみ表示
 * 正解はその場で管理者が A/B/C/D から選択する (競馬方式)
 */
export default function AdminPanel() {
  const { state, actions } = useGame();
  const [confirming, setConfirming] = useState(null);

  const isAdmin =
    new URLSearchParams(window.location.search).get("admin") === "true";
  if (!isAdmin) return null;

  const isFirstQuestion = state.currentQuestionIndex === 0;
  const isLastQuestion = state.currentQuestionIndex >= questions.length - 1;
  const currentQuestion = questions[state.currentQuestionIndex];

  const phaseLabels = {
    waiting: "待機中",
    answering: "回答受付中",
    revealing: "結果発表中",
    revealed: "発表完了",
  };

  const handleStart = async () => {
    await startQuestionAPI(currentQuestion.id);
    actions.startQuestion();
  };

  /** 正解選択: 確認ステップ付き */
  const handleSelectAnswer = (choiceId) => {
    setConfirming(choiceId);
  };

  const handleConfirmAnswer = () => {
    actions.revealAnswer(confirming);
    setConfirming(null);
    setTimeout(() => {
      actions.completeReveal();
    }, 2000);
  };

  const handleCancelConfirm = () => {
    setConfirming(null);
  };

  const handleReset = async () => {
    if (
      window.confirm("ゲームをリセットしますか？ スコアと履歴がすべて初期化されます。")
    ) {
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
          <span className="admin-panel__phase">
            {phaseLabels[state.phase]}
          </span>
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

        {/* 正解選択ボタン群: answering フェーズで表示 */}
        {state.phase === "answering" && !confirming && (
          <div className="admin-panel__answer-select">
            <span className="admin-panel__answer-label">正解を選択:</span>
            {currentQuestion.choices.map((choice) => (
              <button
                key={choice.id}
                className="admin-panel__btn admin-panel__btn--answer"
                onClick={() => handleSelectAnswer(choice.id)}
              >
                {choice.id}
              </button>
            ))}
          </div>
        )}

        {/* 確認ダイアログ */}
        {confirming && (
          <div className="admin-panel__confirm">
            <span className="admin-panel__confirm-text">
              「{confirming}」を正解にしますか？
            </span>
            <button
              className="admin-panel__btn admin-panel__btn--confirm-yes"
              onClick={handleConfirmAnswer}
            >
              &#10003; 確定
            </button>
            <button
              className="admin-panel__btn admin-panel__btn--confirm-no"
              onClick={handleCancelConfirm}
            >
              &#10005; 取消
            </button>
          </div>
        )}

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
