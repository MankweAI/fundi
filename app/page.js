"use client";

import { useState, useEffect } from "react";
import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";
import QuestionSelectScreen from "./components/QuestionSelectScreen";
import GameScreen from "./components/GameScreen";
import CompletionScreen from "./components/CompletionScreen";
import SolutionScreen from "./components/SolutionScreen";
import TopicIntakeScreen from "./components/TopicIntakeScreen";
import CurriculumScreen from "./components/CurriculumScreen";
import LessonScreen from "./components/LessonScreen";
import MasteryQuizScreen from "./components/MasteryQuizScreen";

export default function Page() {
  const [screen, setScreen] = useState("home");
  const [displayScreen, setDisplayScreen] = useState("home");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // State for "Homework Play"
  const [aiResponse, setAiResponse] = useState(null);
  const [selectedQuestionPack, setSelectedQuestionPack] = useState(null);
  const [gamePackData, setGamePackData] = useState(null);
  const [solutionText, setSolutionText] = useState(null);
  const [lastGameResult, setLastGameResult] = useState(null);
  const [completedQuestionIds, setCompletedQuestionIds] = useState(new Set());

  // State for "Topic Mastery"
  const [curriculum, setCurriculum] = useState(null);
  const [currentObjective, setCurrentObjective] = useState(null);
  const [completedObjectives, setCompletedObjectives] = useState(new Set());
  const [masteryQuiz, setMasteryQuiz] = useState(null);

  useEffect(() => {
    if (screen !== displayScreen) {
      setTimeout(() => setDisplayScreen(screen), 150);
    }
  }, [screen]);

  const handleGoHome = () => {
    setScreen("home");
    setError(null);
    setIsLoading(false);
    setAiResponse(null);
    setSelectedQuestionPack(null);
    setGamePackData(null);
    setSolutionText(null);
    setLastGameResult(null);
    setCompletedQuestionIds(new Set());
    setCurriculum(null);
    setCurrentObjective(null);
    setCompletedObjectives(new Set());
    setMasteryQuiz(null);
  };

  const handleProcessRequest = async (formData, action) => {
    setIsLoading(true);
    setError(null);
    try {
      if (action === "game") {
        const response = await fetch("/api/generate-game", {
          method: "POST",
          body: formData,
        });
        if (!response.ok)
          throw new Error(
            (await response.json()).error || "Failed to parse questions."
          );
        const data = await response.json();
        setAiResponse(data);
        setScreen("selecting");
      } else if (action === "solution") {
        const response = await fetch("/api/generate-solution", {
          method: "POST",
          body: formData,
        });
        if (!response.ok)
          throw new Error(
            (await response.json()).error || "Failed to generate solution."
          );
        const data = await response.json();
        setSolutionText(data.solutionText);
        setScreen("solution");
      }
    } catch (err) {
      setError(err.message);
      setScreen("home");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = async (item) => {
    setSelectedQuestionPack(item);
    setScreen("generating");
    setIsLoading(true);
    setError(null);
    const questionsToProcess = item.subQuestions || [item];
    try {
      const gameDataPromises = questionsToProcess.map((q) =>
        fetch("/api/generate-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionText: q.text }),
        }).then((res) => {
          if (!res.ok)
            throw new Error(`Failed to generate game for "${q.label}"`);
          return res.json();
        })
      );
      const generatedGames = await Promise.all(gameDataPromises);
      setGamePackData(generatedGames);
      setScreen("game");
    } catch (err) {
      setError(err.message);
      setScreen("selecting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGameComplete = (result) => {
    setLastGameResult(result);
    setGamePackData(null);
    setScreen("complete");
    const questionsCompleted = selectedQuestionPack.subQuestions || [
      selectedQuestionPack,
    ];
    const completedIds = questionsCompleted.map((q) => q.id);
    setCompletedQuestionIds((prev) => new Set([...prev, ...completedIds]));
  };

  const handleGenerateCurriculum = async (painPoint) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-curriculum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ painPoint }),
      });
      if (!response.ok) throw new Error("Failed to generate your plan.");
      const data = await response.json();
      setCurriculum(data.curriculum);
      setCompletedObjectives(new Set());
      setScreen("topic_curriculum");
    } catch (err) {
      setError(err.message);
      setScreen("topic_intake");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartObjective = (objective) => {
    setCurrentObjective(objective);
    setScreen("topic_lesson");
  };

  const handleObjectiveMastered = async (objectiveId) => {
    const newCompleted = new Set(completedObjectives).add(objectiveId);
    setCompletedObjectives(newCompleted);
    if (newCompleted.size === curriculum.length) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-mastery-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ curriculum }),
        });
        const data = await response.json();
        setMasteryQuiz(data.quiz);
        setScreen("topic_quiz");
      } catch (err) {
        setError(
          "Could not generate your final quiz. Congratulations on finishing the plan!"
        );
        setTimeout(handleGoHome, 3000);
      } finally {
        setIsLoading(false);
      }
    } else {
      setScreen("topic_curriculum");
    }
  };

  const handleStartMicroLesson = (painPoint) => {
    setScreen("topic_intake");
  };

  const renderScreen = () => {
    if (error) {
      return (
        <div className="w-full max-w-md mx-auto text-center">
          <p className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</p>
          <button
            onClick={handleGoHome}
            className="mt-4 text-sm text-gray-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }
    if (isLoading && (screen === "loading" || screen === "generating")) {
      return <LoadingSpinner />;
    }
    switch (displayScreen) {
      case "home":
        return (
          <HomeScreen
            onProcess={handleProcessRequest}
            onStartTopicMastery={() => setScreen("topic_intake")}
            isLoading={isLoading}
          />
        );
      case "selecting":
        return (
          <QuestionSelectScreen
            aiResponse={aiResponse}
            onSelectQuestion={handleSelectQuestion}
            onBack={handleGoHome}
            completedQuestions={completedQuestionIds}
          />
        );
      case "game":
        return (
          <GameScreen
            packInfo={selectedQuestionPack}
            gamePack={gamePackData}
            onComplete={handleGameComplete}
            onStuck={handleStartMicroLesson}
          />
        );
      case "complete":
        return (
          <CompletionScreen
            keySkill={lastGameResult.keySkill}
            solvedSteps={lastGameResult.solvedSteps}
            originalQuestion={
              selectedQuestionPack.text ||
              (selectedQuestionPack.subQuestions &&
                selectedQuestionPack.subQuestions[0].text)
            }
            onNext={() => setScreen("selecting")}
          />
        );
      case "solution":
        return (
          <SolutionScreen solutionText={solutionText} onBack={handleGoHome} />
        );
      case "topic_intake":
        return (
          <TopicIntakeScreen
            onGenerateCurriculum={handleGenerateCurriculum}
            onBack={handleGoHome}
            isLoading={isLoading}
          />
        );
      case "topic_curriculum":
        return (
          <CurriculumScreen
            curriculum={curriculum}
            onStartObjective={handleStartObjective}
            onBack={() => setScreen("topic_intake")}
            completedObjectives={completedObjectives}
          />
        );
      case "topic_lesson":
        return (
          <LessonScreen
            objective={currentObjective}
            onBack={() => setScreen("topic_curriculum")}
            onObjectiveMastered={handleObjectiveMastered}
          />
        );
      case "topic_quiz":
        return (
          <MasteryQuizScreen quiz={masteryQuiz} onComplete={handleGoHome} />
        );
      default:
        return (
          <HomeScreen
            onProcess={handleProcessRequest}
            onStartTopicMastery={() => setScreen("topic_intake")}
            isLoading={isLoading}
          />
        );
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div
        className={
          screen === displayScreen ? "animate-screen-fade-in" : "opacity-0"
        }
      >
        {renderScreen()}
      </div>
    </main>
  );
}
