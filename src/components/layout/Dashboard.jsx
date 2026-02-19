import { useCallback } from "react";
import { useGame } from "../../hooks/useGameState";
import { usePolling } from "../../hooks/usePolling";
import { fetchTeamAnswers } from "../../utils/api";
import { questions, teams } from "../../data/questions";
import QuestionDisplay from "../question/QuestionDisplay";
import OddsBoard from "../odds/OddsBoard";
import TeamStatus from "../teams/TeamStatus";
import Scoreboard from "../scoreboard/Scoreboard";
import ResultHistory from "../scoreboard/ResultHistory";
import FinalResults from "../scoreboard/FinalResults";
import AdminPanel from "../admin/AdminPanel";
import ConfettiEffect from "../effects/ConfettiEffect";
import RevealAnimation from "../effects/RevealAnimation";

export default function Dashboard() {
  const { state, actions } = useGame();
  const currentQuestion = questions[state.currentQuestionIndex];

  const pollAnswers = useCallback(async () => {
    if (state.phase !== "answering" || !currentQuestion) return;
    const answers = await fetchTeamAnswers(
      currentQuestion.id,
      currentQuestion.choices,
      teams
    );
    actions.updateAnswers(answers);
  }, [state.phase, currentQuestion, actions]);

  usePolling(pollAnswers, 5000, state.phase === "answering");

  // 最終結果画面
  if (state.phase === "finished") {
    return (
      <div className="dashboard">
        <FinalResults />
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <QuestionDisplay />

      <div className="dashboard__main">
        <OddsBoard />
        <div className="dashboard__sidebar">
          <TeamStatus />
          <Scoreboard />
        </div>
      </div>

      {/* 結果履歴 (1問以上完了後に表示) */}
      <ResultHistory />

      <AdminPanel />

      <ConfettiEffect />
      <RevealAnimation />
    </div>
  );
}
