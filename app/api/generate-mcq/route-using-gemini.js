import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { questionText } = await request.json();
    if (!questionText) {
      return NextResponse.json(
        { error: "No question text provided." },
        { status: 400 }
      );
    }
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });
    // --- BUG FIX: Updated prompt to handle single-step questions correctly ---
    const prompt = `You are an expert tutor. Take this problem: "${questionText}" and convert it into a step-by-step JSON object. The structure must be: { "steps": [ { "question": "...", "stepResult": "...", "answers": [ { "text": "...", "isCorrect": true }, { "text": "...", "isCorrect": false, "explanation": "..." } ] } ], "keySkill": "..." }. IMPORTANT RULE: If the question can be answered in a single step, the "steps" array MUST contain only one object. Otherwise, break the problem down into logical, sequential steps. Ensure the final output is only raw JSON.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log("Raw Gemini Response for MCQ:", responseText);

    try {
      const jsonString = responseText.replace(/```json|```/g, "").trim();
      const parsedJson = JSON.parse(jsonString);
      return NextResponse.json(parsedJson);
    } catch (e) {
      console.error("MCQ JSON Parsing Error:", e);
      throw new Error(`AI returned invalid JSON for MCQ: ${responseText}`);
    }
  } catch (error) {
    console.error("Error in generate-mcq API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate MCQ game." },
      { status: 500 }
    );
  }
}
