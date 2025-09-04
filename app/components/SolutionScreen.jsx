export default function SolutionScreen({ solutionText, onBack }) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col h-[90vh]">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back to Home
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Here's the Solution</h2>
        <p className="text-gray-500">A step-by-step guide to the answer.</p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 bg-gray-50 p-4 rounded-lg border">
        {/* Using whitespace-pre-wrap to respect newlines from the AI's response */}
        <p className="text-gray-700 whitespace-pre-wrap">{solutionText}</p>
      </div>
    </div>
  );
}

