export default function CompletionScreen({
  keySkill,
  onNext,
  solvedSteps,
  originalQuestion,
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 text-center flex-grow flex flex-col justify-center">
      <h2 className="text-3xl font-bold text-green-500">Problem Solved!</h2>
      <p className="text-gray-600 mt-2">Great job! Keep up the amazing work.</p>
      <div className="text-left bg-gray-50 p-4 rounded-lg my-6">
        <h3 className="font-bold text-gray-800 mb-2">Your Solution Path:</h3>
        <p className="text-sm text-gray-500">{originalQuestion}</p>
        {solvedSteps.map((step, index) => (
          <p key={index} className="text-sm text-gray-700">
            → {step}
          </p>
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
