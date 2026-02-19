import { useGame } from "../../hooks/useGameState";
import { questions } from "../../data/questions";

/**
 * 問題文と選択肢を表示するコンポーネント
 * 正解発表時は正解の選択肢をハイライトする
 */
export default function QuestionDisplay() {
  const { state } = useGame();
  const question = questions[state.currentQuestionIndex];

  if (!question) return null;

  const isRevealed = state.phase === "revealing" || state.phase === "revealed";

  return (
    <section className="question-display" aria-label="問題表示">
      <div className="question-display__header">
        <span className="question-display__number" aria-label={`第${state.currentQuestionIndex + 1}問`}>
          Q.{state.currentQuestionIndex + 1}
        </span>
        <h2 className="question-display__text">{question.text}</h2>
      </div>

      <div className="question-display__choices" role="list" aria-label="選択肢一覧">
        {question.choices.map((choice) => {
          const isCorrect = isRevealed && choice.id === question.answer;
          return (
            <div
              key={choice.id}
              className={`question-display__choice${isCorrect ? " question-display__choice--correct" : ""}`}
              role="listitem"
              aria-label={`${choice.id}: ${choice.text}${isCorrect ? " (正解)" : ""}`}
            >
              <span className="question-display__choice-id">{choice.id}</span>
              <span>{choice.text}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
