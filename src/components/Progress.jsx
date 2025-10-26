import { useQuiz } from "../contexts/QuizContext";

function Progress() {
  const { index, numQuestions, totalPoints, maxPossiblePoints, answer } =
    useQuiz();

  return (
    <header className="progress">
      <progress
        max={numQuestions}
        value={index + Number(answer !== null)}
      ></progress>

      <p>
        Question <strong>{index + 1}</strong> / {numQuestions}
      </p>

      <p>
        <strong>{totalPoints}</strong> / {maxPossiblePoints}
      </p>
    </header>
  );
}

export default Progress;
