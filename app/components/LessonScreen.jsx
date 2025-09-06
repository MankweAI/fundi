"use client";
import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { BlockMath } from "react-katex";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Component to safely render text that might contain asterisks for bolding
const FormattedText = ({ text }) => {
  if (!text) return null;
  // This simple regex finds text between asterisks and wraps it in a <strong> tag.
  const html = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");
  return (
    <p
      className="whitespace-pre-wrap"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export default function LessonScreen({
  objective,
  onBack,
  onObjectiveMastered,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("lesson");
  const [lessonData, setLessonData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);

  useEffect(() => {
    const fetchLesson = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/generate-lesson-challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ objectiveTitle: objective.title }),
        });
        if (!response.ok) throw new Error("Failed to load lesson content.");
        const data = await response.json();
        setLessonData(data);
      } catch (err) {
        setFeedback("Error loading lesson. Please go back and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLesson();
  }, [objective]);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setFeedback("");
    try {
      const response = await fetch("/api/evaluate-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectiveTitle: objective.title,
          challenge: lessonData.challenge,
          userAnswer,
        }),
      });
      if (!response.ok) throw new Error("Failed to evaluate your answer.");
      const data = await response.json();
      if (data.isCorrect) {
        onObjectiveMastered(objective.id);
      } else {
        setFeedback(data.feedback);
        setLessonData((prev) => ({
          ...prev,
          challenge: data.newChallenge,
          visual: data.visual,
        }));
        setUserAnswer("");
      }
    } catch (err) {
      setFeedback(
        "There was an error evaluating your answer. Please try again."
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const renderVisual = () => {
    // --- BUG FIX STARTS HERE ---
    // The previous code crashed if `lessonData.visual.data` or its properties didn't exist.
    // This new version is safer and checks everything before trying to render.

    if (!lessonData?.visual || !lessonData.visual.data) {
      return null;
    }

    const { type, data } = lessonData.visual;

    switch (type) {
      case "chartjs":
        // Specifically check for the data needed by the chart
        if (data.data && data.options) {
          return (
            <div className="bg-white p-4 rounded-lg border my-4">
              <Line data={data.data} options={data.options} />
            </div>
          );
        }
        return null; // Return null if data is incomplete

      case "html_expression":
        // Specifically check for the 'html' property
        if (data.html) {
          return (
            <div
              className="bg-gray-100 p-4 rounded-lg border my-4 text-2xl font-mono text-center"
              dangerouslySetInnerHTML={{ __html: data.html }}
            />
          );
        }
        return null; // Return null if data is incomplete

      case "latex_expression":
        // Specifically check for the 'latex' property
        if (data.latex) {
          return (
            <div className="bg-gray-100 p-4 rounded-lg border my-4 text-xl text-center overflow-x-auto">
              <BlockMath math={data.latex} />
            </div>
          );
        }
        return null; // Return null if data is incomplete

      default:
        return null;
    }
    // --- BUG FIX ENDS HERE ---
  };

  if (isLoading)
    return (
      <div className="w-full max-w-md mx-auto p-8 text-center">
        <p>Loading lesson...</p>
      </div>
    );

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back to Plan
      </button>
      <h2 className="text-xl font-bold mb-2">{objective.title}</h2>

      {view === "lesson" && (
        <div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 my-4">
            <FormattedText text={lessonData?.lesson} />
          </div>
          {renderVisual()}
          <button
            onClick={() => setView("challenge")}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg"
          >
            Next: Practice This Step
          </button>
        </div>
      )}

      {view === "challenge" && (
        <div className="mt-4">
          {renderVisual()}
          <p className="font-semibold">{lessonData?.challenge}</p>
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 mt-2 border-2 border-gray-200 rounded-lg"
            rows={4}
            placeholder="Type your answer or show your work here..."
          />
          {feedback && (
            <div className="text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md">
              <FormattedText text={feedback} />
            </div>
          )}
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating || !userAnswer.trim()}
            className="w-full mt-4 bg-green-600 text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50"
          >
            {isEvaluating ? "Checking..." : "Submit Answer"}
          </button>
        </div>
      )}
    </div>
  );
}
