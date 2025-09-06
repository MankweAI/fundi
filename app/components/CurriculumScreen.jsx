export default function CurriculumScreen({
  curriculum,
  onStartObjective,
  onBack,
  completedObjectives,
}) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Your Personalised Plan</h2>
        <p className="text-gray-500">
          Master each objective to complete your plan.
        </p>
      </div>
      <ul className="space-y-3">
        {curriculum.map((obj, index) => {
          const isCompleted = completedObjectives.has(obj.id);
          const isUnlocked =
            index === 0 || completedObjectives.has(curriculum[index - 1].id);
          return (
            <li
              key={obj.id}
              className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 ${
                isCompleted
                  ? "bg-green-50"
                  : isUnlocked
                  ? "bg-blue-50"
                  : "bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <span className="text-xl">
                  {isCompleted ? "✅" : isUnlocked ? "🔓" : "🔒"}
                </span>
                <span
                  className={`ml-4 font-semibold ${
                    isUnlocked ? "text-gray-800" : "text-gray-400"
                  }`}
                >
                  {index + 1}. {obj.title}
                </span>
              </div>
              {isUnlocked && !isCompleted && (
                <button
                  onClick={() => onStartObjective(obj)}
                  className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

