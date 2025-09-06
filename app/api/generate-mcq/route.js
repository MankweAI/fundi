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
      1.  Break down the *solving process* into logical steps. Each step should be an object in a "steps" array.
      2.  For each step, provide a "keySkill" (e.g., "The Distributive Property").
      3.  Each step's "question" should ask the user what *action* to take.
      4.  The "answers" should be descriptions of possible actions.
      5.  The "stepResult" should show the state of the problem *after* the correct action is performed (e.g., "2x = -4").
      6.  Crucially, for each "stepResult", add a "stepResultVisual" object if the result can be shown visually (e.g., using LaTeX for a math formula).
      
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
