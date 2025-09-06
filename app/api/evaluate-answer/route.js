import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle, challenge, userAnswer } = await request.json();
    // --- TONE CHANGE: Prompt now enforces better formatting for feedback ---
    const systemPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa. Your language must be very simple, clear, and positive.

      1.  Determine if the user's answer is correct for the given challenge.
      2.  If it is INCORRECT, give gentle, positive feedback.
          - Start with something nice like "Almost!" or "Great try!".
          - Explain the mistake simply, using short sentences or a bullet point.
          - Emphasize *key terms* with asterisks.
          - Generate a NEW, slightly different practice question that tests the exact same skill.
      3.  The output must be a JSON object with the structure:
          - For a correct answer: { "isCorrect": true }
          - For an incorrect answer: { "isCorrect": false, "feedback": "Your well-formatted feedback...", "newChallenge": "..." }
      
      Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Objective: "${objectiveTitle}"\nChallenge: "${challenge}"\nStudent's Answer: "${userAnswer}"`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error evaluating answer:", error.message);
    return NextResponse.json(
      { error: "Failed to evaluate answer." },
      { status: 500 }
    );
  }
}
