export default function QuestionSelectScreen({
  aiResponse,
  onSelectQuestion,
  onBack,
  completedQuestions,
}) {
  const renderItem = (item) => {
    const isPack = item.subQuestions && item.subQuestions.length > 0;

    const isPackCompleted = isPack
      ? item.subQuestions.every((sq) => completedQuestions.has(sq.id))
      : false;
    const isSingleCompleted = !isPack && completedQuestions.has(item.id);
    const isCompleted = isPackCompleted || isSingleCompleted;

    // --- CHANGE: Updated the title for question packs ---
    const title = isPack ? item.label.replace(" Pack", "") : item.label;
    const text = isPack
      ? `Contains ${item.subQuestions.length} parts: ${item.subQuestions
          .map((sq) => sq.label)
          .join(", ")}`
      : item.text;

    return (
      <li
        key={item.id}
        className={`p-4 rounded-lg transition-colors duration-300 ${
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-gray-50 border-gray-200"
        } border`}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="font-bold text-gray-800">{title}</p>
            <p className="text-sm text-gray-600 mt-1 break-words">{text}</p>
          </div>
          {isCompleted && (
            <div className="ml-2 mt-1 flex-shrink-0 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
              ✓
            </div>
          )}
        </div>
        <button
          onClick={() => onSelectQuestion(item)}
          className="w-full mt-3 bg-amber-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors duration-300"
        >
          {isCompleted ? "Play Again" : "Play this question"}
        </button>
      </li>
    );
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col h-[90vh]">
      <button
        onClick={onBack}
        className="self-start mb-4 text-sm text-gray-600 hover:text-black"
      >
        &larr; Back
      </button>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">We found these questions!</h2>
        <p className="text-gray-500">Which one do you want to tackle first?</p>
      </div>
      <div className="flex-grow overflow-y-auto pr-2">
        <ul className="space-y-3">{aiResponse.questions.map(renderItem)}</ul>
      </div>
    </div>
  );
}
