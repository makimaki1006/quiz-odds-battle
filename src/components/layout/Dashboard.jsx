import { useCallback } from "react";
import { useGame } from "../../hooks/useGameState";
import { usePolling } from "../../hooks/usePolling";
import { fetchTeamAnswers } from "../../utils/api";
import { questions, teams } from "../../data/questions";
import QuestionDisplay from "../question/QuestionDisplay";
import OddsBoard from "../odds/OddsBoard";
import TeamStatus from "../teams/TeamStatus";
import Scoreboard from "../scoreboard/Scoreboard";
import AdminPanel from "../admin/AdminPanel";
import ConfettiEffect from "../effects/ConfettiEffect";
import RevealAnimation from "../effects/RevealAnimation";

/**
 * メインダッシュボードレイアウト
 * CSS Gridによるプロジェクター投影用レイアウト
 *
 * +-----------------------------------------------+
 * |           QuestionDisplay (問題文)              |
 * +-------------------------------+---------------+
 * |                               |  TeamStatus   |
 * |         OddsBoard             |  (回答状況)    |
 * |                               |---------------+
 * |                               |  Scoreboard   |
 * |                               |  (スコア)     |
 * +-------------------------------+---------------+
 * |        AdminPanel (管理者のみ)                  |
 * +-----------------------------------------------+
 */
export default function Dashboard() {
  const { state, actions } = useGame();
  const currentQuestion = questions[state.currentQuestionIndex];

  // ポーリングコールバック: answeringフェーズ中にチーム回答を取得
  const pollAnswers = useCallback(async () => {
    if (state.phase !== "answering" || !currentQuestion) return;
    const answers = await fetchTeamAnswers(
      currentQuestion.id,
      currentQuestion.choices,
      teams
    );
    actions.updateAnswers(answers);
  }, [state.phase, currentQuestion, actions]);

  // 5秒間隔でポーリング (answering フェーズのみ)
  usePolling(pollAnswers, 5000, state.phase === "answering");

  return (
    <div className="dashboard">
      {/* 上段: 問題表示 */}
      <QuestionDisplay />

      {/* 中段: メインエリア (左: オッズ / 右: サイドバー) */}
      <div className="dashboard__main">
        <OddsBoard />
        <div className="dashboard__sidebar">
          <TeamStatus />
          <Scoreboard />
        </div>
      </div>

      {/* 下段: 管理者パネル */}
      <AdminPanel />

      {/* エフェクト (DOM外に描画) */}
      <ConfettiEffect />
      <RevealAnimation />
    </div>
  );
}
