import { useState, useEffect } from "react";

export default function GameScreen({ packInfo, gamePack, onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [solvedSteps, setSolvedSteps] = useState([]);

  useEffect(() => {
    setCurrentQuestionIndex(0);
    setCurrentStep(0);
    setSelectedAnswer(null);
    setSolvedSteps([]);
  }, [packInfo]);

  const currentGameData = gamePack[currentQuestionIndex];
  const currentQuestion = packInfo.subQuestions
    ? packInfo.subQuestions[currentQuestionIndex]
    : packInfo;

  // Guard against rendering before data is ready
  if (
    !currentGameData ||
    !currentGameData.steps ||
    !currentGameData.steps[currentStep]
  ) {
    return null; // Or a loading indicator
  }
  const step = currentGameData.steps[currentStep];

  const totalStepsInPack = gamePack.reduce(
    (sum, game) => sum + game.steps.length,
    0
  );
  const completedStepsInPack = gamePack
    .slice(0, currentQuestionIndex)
    .reduce((sum, game) => sum + game.steps.length, 0);
  const progress =
    totalStepsInPack > 0
      ? ((completedStepsInPack + currentStep) / totalStepsInPack) * 100
      : 0;

  const handleAnswerClick = (answerIndex) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const answer = step.answers[answerIndex];

    if (answer.isCorrect) {
      setTimeout(() => {
        const newSolvedSteps = step.stepResult
          ? [...solvedSteps, step.stepResult]
          : solvedSteps;
        setSolvedSteps(newSolvedSteps);

        const isLastStep = currentStep >= currentGameData.steps.length - 1;
        const isLastQuestion = currentQuestionIndex >= gamePack.length - 1;

        if (isLastStep && isLastQuestion) {
          onComplete({
            solvedSteps: newSolvedSteps,
            keySkill: currentGameData.keySkill,
          });
        } else if (isLastStep) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
          setCurrentStep(0);
        } else {
          setCurrentStep((prevStep) => prevStep + 1);
        }
        // --- BUG FIX: Reset selected answer state for the next step ---
        setSelectedAnswer(null);
      }, 1000);
    } else {
      setTimeout(() => {
        setSelectedAnswer(null);
      }, 500);
    }
  };

  const titleLabel = packInfo.subQuestions
    ? `${packInfo.label} (${currentQuestionIndex + 1}/${gamePack.length})`
    : packInfo.label;

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col h-[95vh]">
      <div>
        <p className="text-sm text-gray-500">{titleLabel}</p>
        <p className="font-semibold text-lg bg-gray-100 p-3 rounded-lg">
          {currentQuestion.text}
        </p>
        <div className="mt-2 space-y-1 h-24 overflow-y-auto">
          {solvedSteps.map((solved, index) => (
            <p key={index} className="text-gray-600 animate-fade-in">
              → {solved}
            </p>
          ))}
        </div>
      </div>
      <div className="my-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-center mb-5">
          {step.question}
        </h3>
        <div className="space-y-3">
          {step.answers.map((ans, index) => (
            <div key={`${currentQuestion.id}-${currentStep}-${index}`}>
              <button
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
                className={`w-full p-4 text-left rounded-lg border-2 transition-all duration-300 ${
                  selectedAnswer === index
                    ? ans.isCorrect
                      ? "bg-green-100 border-green-500"
                      : "bg-red-100 border-red-500 animate-shake"
                    : "bg-white border-gray-200 hover:bg-gray-50"
                }`}
              >
                {ans.text}
              </button>
              {selectedAnswer === index && !ans.isCorrect && (
                <p className="text-red-600 text-sm mt-1 p-2 bg-red-50 rounded-md">
                  {ans.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
