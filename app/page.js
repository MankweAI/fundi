"use client";

import { useState, useEffect } from "react";
import HomeScreen from "./components/HomeScreen";
import LoadingSpinner from "./components/LoadingSpinner";
import QuestionSelectScreen from "./components/QuestionSelectScreen";
import GameScreen from "./components/GameScreen";
import CompletionScreen from "./components/CompletionScreen";
import SolutionScreen from "./components/SolutionScreen";

export default function Page() {
  const [screen, setScreen] = useState("home");
  const [error, setError] = useState(null);

  const [aiResponse, setAiResponse] = useState(null);
  const [selectedQuestionPack, setSelectedQuestionPack] = useState(null);
  const [gamePackData, setGamePackData] = useState(null);
  const [solutionText, setSolutionText] = useState(null);
  const [lastGameResult, setLastGameResult] = useState(null);
  const [completedQuestionIds, setCompletedQuestionIds] = useState(new Set());
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [firstCompletionTime, setFirstCompletionTime] = useState(null);

  useEffect(() => {
    setSessionStartTime(Date.now());
    trackEvent("session_start");
    const handleBeforeUnload = () => {
      if (sessionStartTime) {
        const sessionLengthSeconds = (Date.now() - sessionStartTime) / 1000;
        // Note: fetch in 'beforeunload' is not guaranteed, but we try.
        trackEvent("session_end", {
          session_length_seconds: sessionLengthSeconds,
        });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const trackEvent = async (eventName, properties = {}) => {
    console.log(`[METRIC TRACKED] Event: ${eventName}`, properties);
    try {
      await fetch("/api/track-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, properties }),
      });
    } catch (error) {
      console.error("Failed to track event to Supabase:", error);
    }
  };

const handleProcessRequest = async (formData, action, inputType) => {
  // ... (rest of the function is the same, now calls the Supabase-backed trackEvent)
  setScreen("loading");
  setError(null);
  trackEvent("core_action_taken", { action, input_type: inputType });
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
      if (!data.questions || !Array.isArray(data.questions))
        throw new Error("AI returned an invalid format.");
      trackEvent("questions_processed", {
        question_count: data.questions.length,
      });
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
  }
};


  const handleSelectQuestion = async (item) => {
    setSelectedQuestionPack(item);
    setScreen("generating");
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
    }
  };

  const handleGameComplete = (result) => {
    setLastGameResult(result);
    setGamePackData(null);
    setScreen("complete");

    // --- BUG FIX: Add the IDs of all completed questions to our state set ---
    const questionsCompleted = selectedQuestionPack.subQuestions || [
      selectedQuestionPack,
    ];
    const completedIds = questionsCompleted.map((q) => q.id);
    setCompletedQuestionIds((prev) => new Set([...prev, ...completedIds]));
  };

  // --- RENDER LOGIC ---
  const renderScreen = () => {
    if (error && (screen === "home" || screen === "selecting")) {
      return (
        <div className="w-full max-w-md mx-auto text-center">
          <p className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</p>
          <button
            onClick={() => {
              setError(null);
              setScreen("home");
              setAiResponse(null);
            }}
            className="mt-4 text-sm text-gray-600 hover:underline"
          >
            Try again
          </button>
        </div>
      );
    }

    switch (screen) {
      case "loading":
      case "generating":
        return <LoadingSpinner />;
      case "selecting":
        return (
          <QuestionSelectScreen
            aiResponse={aiResponse}
            onSelectQuestion={handleSelectQuestion}
            onBack={() => {
              setAiResponse(null);
              setScreen("home");
            }}
            completedQuestions={completedQuestionIds} // Pass the set as a prop
          />
        );
      case "game":
        return (
          <GameScreen
            packInfo={selectedQuestionPack}
            gamePack={gamePackData}
            onComplete={handleGameComplete}
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
          <SolutionScreen
            solutionText={solutionText}
            onBack={() => {
              setSolutionText(null);
              setScreen("home");
            }}
          />
        );
      case "home":
      default:
        return (
          <HomeScreen
            onProcess={handleProcessRequest}
            isLoading={screen === "loading" || screen === "generating"}
          />
        );
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      {renderScreen()}
    </main>
  );
}
