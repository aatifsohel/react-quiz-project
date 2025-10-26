import { useContext } from "react";
import { useEffect } from "react";
import { useReducer } from "react";
import { createContext } from "react";

const QuizContext = createContext();

const SEC_PER_QUESTION = 30;

const initialState = {
  questions: [],
  // loading, error, ready, active, finished
  status: "loading",
  // it's here bcoz we need to re-render after update index
  index: 0,
  // initial answer will be null
  answer: null,
  totalPoints: 0,
  highscore: 0,
  secondsRemaining: null,
};

function reducerFn(state, action) {
  switch (action.type) {
    case "dataReceived":
      return {
        ...state,
        questions: action.payload,
        status: "ready",
      };

    case "dataFailed":
      return {
        ...state,
        status: "error",
      };

    case "start":
      return {
        ...state,
        status: "active",
        secondsRemaining: state.questions.length * SEC_PER_QUESTION,
      };

    case "newAnswer": {
      // current question based on index from questions arr
      // each question has diffeerent point & total points is in state
      // we can also use this logic where we handle the event but that will be against the useReducer hook rule
      const question = state.questions.at(state.index);

      return {
        ...state,
        answer: action.payload,
        totalPoints:
          action.payload === question.correctOption
            ? state.totalPoints + question.points
            : state.totalPoints,
      };
    }

    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };

    case "finish":
      return {
        ...state,
        status: "finished",
        highscore:
          state.totalPoints > state.highscore
            ? state.totalPoints
            : state.highscore,
      };

    case "restart":
      return {
        ...initialState,
        questions: state.questions,
        status: "ready",
        highscore: state.highscore,
      };

    case "tick":
      return {
        ...state,
        secondsRemaining: state.secondsRemaining - 1,
        status: state.secondsRemaining === 0 ? "finished" : state.status,
      };

    default:
      throw new Error("Action unknown");
  }
}

function QuizProvider({ children }) {
  const [
    {
      questions,
      status,
      index,
      answer,
      totalPoints,
      highscore,
      secondsRemaining,
    },
    dispatch,
  ] = useReducer(reducerFn, initialState);

  console.log(questions);

  const numQuestions = questions.length;

  const maxPossiblePoints = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );

  useEffect(function () {
    async function getData() {
      try {
        const res = await fetch("http://localhost:8000/questions");

        if (!res.ok) throw new Error("Something went wrong with fetching data");

        const data = await res.json();
        //dispatching action of type `dataReceived'
        dispatch({ type: "dataReceived", payload: data });
      } catch (err) {
        //dispatching action of type `dataFailed`
        dispatch({ type: "dataFailed" });
        console.error(err.message);
      }
    }

    getData();
  }, []);

  return (
    <QuizContext.Provider
      value={{
        questions,
        status,
        index,
        answer,
        totalPoints,
        highscore,
        secondsRemaining,
        numQuestions,
        maxPossiblePoints,
        dispatch,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

function useQuiz() {
  const context = useContext(QuizContext);

  if (context === undefined)
    throw new Error("QuizContext was used outside the QuizContext");

  return context;
}

export { QuizProvider, useQuiz };
