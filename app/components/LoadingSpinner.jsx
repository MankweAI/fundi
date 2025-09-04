export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-600">Analyzing...</p>
    </div>
  );
}
