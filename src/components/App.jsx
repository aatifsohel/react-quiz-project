import { useEffect, useReducer } from "react";
import Header from "./Header";
import MainComponent from "./MainComponent";
import Loader from "./Loader";
import Error from "./ErrorComponent";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";

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

    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [
    { questions, status, index, answer, totalPoints, highscore },
    dispatch,
  ] = useReducer(reducerFn, initialState);

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
    <div className="app">
      <Header />
      <MainComponent>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              totalPoints={totalPoints}
              maxPossiblePoints={maxPossiblePoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <NextButton
              dispatch={dispatch}
              numQuestions={numQuestions}
              index={index}
              answer={answer}
            />
          </>
        )}

        {status === "finished" && (
          <FinishScreen
            totalPoints={totalPoints}
            maxPossiblePoints={maxPossiblePoints}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </MainComponent>
    </div>
  );
}
