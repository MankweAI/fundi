"use client";
import { useRef, useState } from "react";

export default function HomeScreen({ onProcess, isLoading }) {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageUploadClick = () => fileInputRef.current?.click();
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setTextInput("");
      setError(null);
    }
  };
  const handleSubmit = (action) => {
    if (!textInput && !imageFile) {
      setError("Please type a question or upload an image.");
      return;
    }
    setError(null);
    const formData = new FormData();
    if (textInput) formData.append("textInput", textInput);
    if (imageFile) formData.append("imageFile", imageFile);
    onProcess(formData, action);
  };
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800">
          The GOAT <span className="text-amber-500">AI</span>
        </h1>
        <p className="text-gray-500 mt-2">Turn your homework into a game.</p>
      </div>
      <div className="my-8 flex flex-col items-center">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <button
          onClick={handleImageUploadClick}
          className="w-32 h-32 bg-gradient-to-br from-amber-400 to-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-105 transition-transform duration-300"
        >
          <svg
            xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
        </button>
        <p className="mt-3 text-sm text-gray-500 h-5">
          {imageFile ? `Selected: ${imageFile.name}` : "Upload a question"}
        </p>
      </div>
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative bg-white px-2 text-sm text-gray-500">OR</div>
      </div>
      <div className="flex flex-col">
        <textarea
          value={textInput}
          onChange={(e) => {
            setTextInput(e.target.value);
            setImageFile(null);
            setError(null);
          }}
          className="w-full p-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
          rows={3}
          placeholder="...type or paste your homework here."
          disabled={isLoading}
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          onClick={() => handleSubmit("game")}
          className="w-full mt-4 bg-gradient-to-br from-amber-400 to-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 disabled:opacity-50"
          disabled={isLoading}
        >
          Start Game
        </button>
        <button
          onClick={() => handleSubmit("solution")}
          className="w-full mt-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50"
          disabled={isLoading}
        >
          Show Me The Solution
        </button>
      </div>
    </div>
  );
}
