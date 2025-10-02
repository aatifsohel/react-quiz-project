import { useEffect, useReducer } from "react";
import Header from "./Header";
import MainComponent from "./MainComponent";
import Loader from "./Loader";
import Error from "./ErrorComponent";
import StartScreen from "./StartScreen";

const initialState = {
  questions: [],
  // loading, error, ready, active, finished
  status: "loading",
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

    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [{ questions, status }, dispatch] = useReducer(reducerFn, initialState);

  const numQuestions = questions.length;

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
        {status === "ready" && <StartScreen numQuestions={numQuestions} />}
      </MainComponent>
    </div>
  );
}
