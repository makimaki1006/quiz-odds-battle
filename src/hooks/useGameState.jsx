import { createContext, useContext, useReducer, useCallback } from "react";
import { questions, teams } from "../data/questions";
import { calculateOdds } from "../utils/odds";
import { calculateScores } from "../utils/scoring";

// --- アクションタイプ ---
const ActionTypes = {
  START_QUESTION: "START_QUESTION",
  UPDATE_ANSWERS: "UPDATE_ANSWERS",
  REVEAL_ANSWER: "REVEAL_ANSWER",
  COMPLETE_REVEAL: "COMPLETE_REVEAL",
  NEXT_QUESTION: "NEXT_QUESTION",
  PREV_QUESTION: "PREV_QUESTION",
  RESET_GAME: "RESET_GAME",
};

// --- 初期ステート ---
function createInitialState() {
  const initialScores = {};
  teams.forEach((team) => {
    initialScores[team.id] = 0;
  });

  return {
    phase: "waiting", // "waiting" | "answering" | "revealing" | "revealed"
    currentQuestionIndex: 0,
    teamAnswers: {},   // { teamId: choiceId }
    scores: initialScores, // { teamId: totalScore }
    odds: {},          // { choiceId: odds }
    revealedAnswer: null,  // 正解発表時の choiceId
  };
}

// --- Reducer ---
function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.START_QUESTION: {
      // 回答フェーズ開始: teamAnswers とオッズをリセット
      return {
        ...state,
        phase: "answering",
        teamAnswers: {},
        odds: {},
        revealedAnswer: null,
      };
    }

    case ActionTypes.UPDATE_ANSWERS: {
      // チーム回答を更新し、オッズを再計算
      const { teamAnswers } = action.payload;
      const currentQuestion = questions[state.currentQuestionIndex];
      const newOdds = calculateOdds(
        currentQuestion.choices,
        teamAnswers,
        teams.length
      );

      return {
        ...state,
        teamAnswers,
        odds: newOdds,
      };
    }

    case ActionTypes.REVEAL_ANSWER: {
      // 正解発表フェーズ開始
      const currentQuestion = questions[state.currentQuestionIndex];
      return {
        ...state,
        phase: "revealing",
        revealedAnswer: currentQuestion.answer,
      };
    }

    case ActionTypes.COMPLETE_REVEAL: {
      // 正解発表完了: スコアを加算
      const currentQuestion = questions[state.currentQuestionIndex];
      const newScores = calculateScores(
        state.scores,
        state.teamAnswers,
        currentQuestion.answer,
        state.odds
      );

      return {
        ...state,
        phase: "revealed",
        scores: newScores,
      };
    }

    case ActionTypes.NEXT_QUESTION: {
      // 次の問題へ移行
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= questions.length) {
        // 全問終了: revealed のまま維持
        return state;
      }

      return {
        ...state,
        phase: "waiting",
        currentQuestionIndex: nextIndex,
        teamAnswers: {},
        odds: {},
        revealedAnswer: null,
      };
    }

    case ActionTypes.PREV_QUESTION: {
      // 前の問題に戻る
      const prevIndex = state.currentQuestionIndex - 1;
      if (prevIndex < 0) {
        return state;
      }

      return {
        ...state,
        phase: "waiting",
        currentQuestionIndex: prevIndex,
        teamAnswers: {},
        odds: {},
        revealedAnswer: null,
      };
    }

    case ActionTypes.RESET_GAME: {
      // ゲーム全体をリセット
      return createInitialState();
    }

    default:
      return state;
  }
}

// --- Context ---
const GameContext = createContext(null);

/**
 * ゲーム状態を提供する Context Provider
 * アプリ全体をラップして使用する
 */
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

/**
 * ゲーム状態と dispatch にアクセスするための hook
 * @returns {{ state: Object, dispatch: Function, actions: Object }}
 */
export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame は GameProvider 内で使用してください");
  }

  const { state, dispatch } = context;

  // --- アクションクリエイター ---
  const startQuestion = useCallback(() => {
    dispatch({ type: ActionTypes.START_QUESTION });
  }, [dispatch]);

  const updateAnswers = useCallback(
    (teamAnswers) => {
      dispatch({
        type: ActionTypes.UPDATE_ANSWERS,
        payload: { teamAnswers },
      });
    },
    [dispatch]
  );

  const revealAnswer = useCallback(() => {
    dispatch({ type: ActionTypes.REVEAL_ANSWER });
  }, [dispatch]);

  const completeReveal = useCallback(() => {
    dispatch({ type: ActionTypes.COMPLETE_REVEAL });
  }, [dispatch]);

  const nextQuestion = useCallback(() => {
    dispatch({ type: ActionTypes.NEXT_QUESTION });
  }, [dispatch]);

  const prevQuestion = useCallback(() => {
    dispatch({ type: ActionTypes.PREV_QUESTION });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    dispatch({ type: ActionTypes.RESET_GAME });
  }, [dispatch]);

  return {
    state,
    dispatch,
    actions: {
      startQuestion,
      updateAnswers,
      revealAnswer,
      completeReveal,
      nextQuestion,
      prevQuestion,
      resetGame,
    },
  };
}
