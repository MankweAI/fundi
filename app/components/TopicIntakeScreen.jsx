"use client";
import { useState } from "react";

export default function TopicIntakeScreen({
  onGenerateCurriculum,
  onBack,
  isLoading,
}) {
  const [painPoint, setPainPoint] = useState("");

  const handleSubmit = () => {
    if (painPoint.trim()) {
      onGenerateCurriculum(painPoint);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back
      </button>
      <div className="text-center">
        <h2 className="text-2xl font-bold">Master a Topic</h2>
        <p className="text-gray-500 mt-2">
          What topic from class is giving you trouble? Be as specific as you
          can.
        </p>
      </div>
      <div className="my-8">
        <textarea
          value={painPoint}
          onChange={(e) => setPainPoint(e.target.value)}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
          rows={4}
          placeholder="e.g., I don't get grade 10 algebra, especially when there are brackets and fractions."
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={isLoading || !painPoint.trim()}
        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50"
      >
        {isLoading ? "Building Your Plan..." : "Create My Personal Plan"}
      </button>
    </div>
  );
}

