"use client";
import { useState } from "react";

export default function MasteryQuizScreen({ quiz, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const question = quiz[currentQuestionIndex];

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === question.correctAnswer) {
      setScore((s) => s + 1);
    }
    setTimeout(() => {
      if (currentQuestionIndex < quiz.length - 1) {
        setCurrentQuestionIndex((i) => i + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1000);
  };

  if (isFinished) {
    return (
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <h2 className="text-3xl font-bold">Topic Mastered! 🏆</h2>
        <p className="text-gray-600 mt-4 text-xl">
          Your Score:{" "}
          <span className="font-bold">
            {score} / {quiz.length}
          </span>
        </p>
        <button
          onClick={onComplete}
          className="w-full mt-8 bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <h2 className="text-2xl font-bold text-center">Mastery Quiz</h2>
      <div className="my-6">
        <p className="font-semibold text-lg">
          {currentQuestionIndex + 1}. {question.question}
        </p>
        <div className="space-y-3 mt-4">
          {question.answers.map((ans, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(ans)}
              disabled={selectedAnswer !== null}
              className={`w-full p-4 text-left rounded-lg border-2 transition-colors duration-300 ${
                selectedAnswer
                  ? ans === question.correctAnswer
                    ? "bg-green-100 border-green-500"
                    : ans === selectedAnswer
                    ? "bg-red-100 border-red-500"
                    : "bg-white border-gray-200"
                  : "bg-white border-gray-200 hover:bg-blue-50"
              }`}
            >
              {ans}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
