import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// (fileToGenerativePart function remains the same)
async function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const textInput = formData.get("textInput");
    const imageFile = formData.get("imageFile");

    if (!textInput && !imageFile) {
      return NextResponse.json(
        { error: "No input provided." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
    });

    // --- FEATURE UPDATE: New, more sophisticated prompt ---
    const prompt = `You are an expert educational tool. Your task is to analyze homework and structure it into a specific JSON format.
      
      RULES:
      1.  Identify introductory text or context statements (e.g., "Consider the following...", "Read the passage...") and DO NOT classify them as questions.
      2.  Group related sub-questions (e.g., 1.1, 1.2, 1.3) under a single "pack".
      3.  The final output must be a JSON object with a single key "questions", which is an array.
      4.  Items in the array can be EITHER a single question object OR a "pack" object.
      
      JSON STRUCTURES:
      -   For a single question: { "id": "q1", "label": "Question 1", "text": "What is the capital of Kenya?" }
      -   For a pack of sub-questions: { "id": "q2_pack", "label": "Question 2 Pack", "subQuestions": [ { "id": "q2_1", "label": "2.1", "text": "First part..." }, { "id": "q2_2", "label": "2.2", "text": "Second part..." } ] }
      
      Each question object, whether standalone or in a pack, MUST have "id", "label", and "text". A pack object MUST have "id", "label", and a "subQuestions" array.
      The output must be ONLY the raw JSON.
      
      Here is the homework:`;

    // (handleGeneration function and the rest of the file remains the same)
    const handleGeneration = async (content) => {
      const result = await model.generateContent(content);
      const response = await result.response;
      const responseText = response.text();

      console.log("Raw Gemini Response:", responseText);

      try {
        const jsonString = responseText.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonString);
      } catch (e) {
        console.error("JSON Parsing Error:", e);
        throw new Error(`AI returned invalid JSON: ${responseText}`);
      }
    };

    let parsedJson;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imagePart = await fileToGenerativePart(buffer, imageFile.type);
      parsedJson = await handleGeneration([prompt, imagePart]);
    } else {
      parsedJson = await handleGeneration([prompt, textInput]);
    }

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Error in generate-game API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate game data." },
      { status: 500 }
    );
  }
}
