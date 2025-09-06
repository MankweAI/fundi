"use client";
import { BlockMath } from "react-katex";

// This component now has a simple visual renderer for the solution summary
const renderVisual = (visual) => {
  if (!visual) return null;
  if (visual.type === "latex_expression") {
    return <BlockMath math={visual.data.latex} />;
  }
  // Add other visual types here if needed
  return null;
};

export default function CompletionScreen({
  keySkill,
  onNext,
  solvedSteps,
  originalQuestion,
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center flex-grow flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-green-500">Problem Solved! 🏆</h2>
      <p className="text-gray-600 mt-2">Great job! Keep up the amazing work.</p>
      <div className="text-left bg-gray-50 p-4 rounded-lg my-6 max-h-60 overflow-y-auto">
        <h3 className="font-bold text-gray-800 mb-2">Your Solution Path:</h3>
        <p className="text-sm text-gray-500">{originalQuestion}</p>
        {/* Now renders both text and visuals */}
        {solvedSteps.map((step, index) => (
          <div key={index} className="mt-2">
            <p className="text-sm text-gray-700">→ {step.text}</p>
            {step.visual && (
              <div className="pl-4">{renderVisual(step.visual)}</div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 rounded-md">
        <p>
          <span className="font-bold">Key Skill:</span> {keySkill}
        </p>
      </div>
      <button
        onClick={onNext}
        className="w-full mt-8 bg-amber-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-amber-600 transition-colors duration-300"
      >
        Choose Another Question
      </button>
    </div>
  );
}
