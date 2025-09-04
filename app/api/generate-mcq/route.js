import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { questionText } = await request.json();
    if (!questionText) {
      return NextResponse.json(
        { error: "No question text provided." },
        { status: 400 }
      );
    }

    // --- BUG FIX: New, more intelligent prompt to guide the user step-by-step ---
    const systemPrompt = `You are an expert tutor. Your task is to take a single user-submitted problem and transform it into a step-by-step interactive game.

      RULES:
      1.  Analyze the problem to determine if it's a single-step question (e.g., a simple definition) or a multi-step problem (e.g., an algebraic equation).
      2.  For a **multi-step problem**, you must break down the *solving process* into logical steps.
          - Each "question" in the JSON should ask the user what *action* to take for that step (e.g., "What is the first step to isolate 'x'?").
          - The "answers" should be descriptions of possible actions (e.g., "Add 3 to both sides.").
          - The "stepResult" should show the state of the problem *after* the correct action is performed (e.g., "2x = -4").
      3.  For a **single-step question**, the "steps" array should contain only one object.
          - The "question" should be the original problem text.
          - The "answers" should be the direct potential answers to that question.
      4.  The output must be a valid JSON object with the following structure: { "steps": [ { "question": "...", "stepResult": "...", "answers": [ { "text": "...", "isCorrect": true }, { "text": "...", "isCorrect": false, "explanation": "..." } ] } ], "keySkill": "..." }.
      
      Example for a multi-step problem "Solve 2x - 3 = -7":
      The first step's question would be something like "What's the first action to take?", and its answers would be "Add 3 to both sides", "Subtract 3 from both sides", etc. The stepResult would be "2x = -4".`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o", // Using a more advanced model for better reasoning
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `The problem is: "${questionText}"` },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    const parsedJson = JSON.parse(responseText);

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Error in generate-mcq API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate MCQ game." },
      { status: 500 }
    );
  }
}
