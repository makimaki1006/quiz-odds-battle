import { createContext, useContext, useReducer, useCallback } from "react";
import { questions, teams } from "../data/questions";
import { calculateOdds } from "../utils/odds";
import { calculateScores, getScoreDelta } from "../utils/scoring";

const ActionTypes = {
  START_QUESTION: "START_QUESTION",
  UPDATE_ANSWERS: "UPDATE_ANSWERS",
  REVEAL_ANSWER: "REVEAL_ANSWER",
  COMPLETE_REVEAL: "COMPLETE_REVEAL",
  NEXT_QUESTION: "NEXT_QUESTION",
  PREV_QUESTION: "PREV_QUESTION",
  RESET_GAME: "RESET_GAME",
};

function createInitialState() {
  const initialScores = {};
  teams.forEach((team) => {
    initialScores[team.id] = 0;
  });

  return {
    phase: "waiting",
    currentQuestionIndex: 0,
    teamAnswers: {},
    scores: initialScores,
    odds: {},
    revealedAnswer: null,
    // 結果履歴: 各問題の正解・オッズ・チーム別スコア変動を記録
    results: [],
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case ActionTypes.START_QUESTION: {
      return {
        ...state,
        phase: "answering",
        teamAnswers: {},
        odds: {},
        revealedAnswer: null,
      };
    }

    case ActionTypes.UPDATE_ANSWERS: {
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
      // 管理者がその場で正解を選択する
      const { correctAnswer } = action.payload;
      return {
        ...state,
        phase: "revealing",
        revealedAnswer: correctAnswer,
      };
    }

    case ActionTypes.COMPLETE_REVEAL: {
      const currentQuestion = questions[state.currentQuestionIndex];
      const correctAnswer = state.revealedAnswer;
      const newScores = calculateScores(
        state.scores,
        state.teamAnswers,
        correctAnswer,
        state.odds
      );

      // 結果を履歴に記録
      const teamResults = {};
      teams.forEach((team) => {
        const delta = getScoreDelta(
          team.id,
          state.teamAnswers,
          correctAnswer,
          state.odds
        );
        teamResults[team.id] = {
          answer: state.teamAnswers[team.id] || null,
          delta,
          isCorrect: state.teamAnswers[team.id] === correctAnswer,
        };
      });

      const result = {
        questionIndex: state.currentQuestionIndex,
        questionText: currentQuestion.text,
        correctAnswer,
        correctChoiceText: currentQuestion.choices.find(
          (c) => c.id === correctAnswer
        )?.text,
        odds: { ...state.odds },
        teamResults,
      };

      return {
        ...state,
        phase: "revealed",
        scores: newScores,
        results: [...state.results, result],
      };
    }

    case ActionTypes.NEXT_QUESTION: {
      const nextIndex = state.currentQuestionIndex + 1;
      if (nextIndex >= questions.length) return state;
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
      const prevIndex = state.currentQuestionIndex - 1;
      if (prevIndex < 0) return state;
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
      return createInitialState();
    }

    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);
  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame は GameProvider 内で使用してください");
  }

  const { state, dispatch } = context;

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

  // 管理者がその場で正解を選ぶ
  const revealAnswer = useCallback(
    (correctAnswer) => {
      dispatch({
        type: ActionTypes.REVEAL_ANSWER,
        payload: { correctAnswer },
      });
    },
    [dispatch]
  );

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
