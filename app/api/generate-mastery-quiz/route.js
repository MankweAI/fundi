import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { curriculum } = await request.json();
    const systemPrompt = `You are an expert educator. Based on the provided curriculum objectives, create a short "Mastery Quiz" of 3-4 questions that tests the user's combined knowledge of all topics. The questions should be in a multiple-choice format.

      The output must be a JSON object with a single key "quiz", which is an array of question objects. Each object must have "question", an array of "answers", and the "correctAnswer".
      
      Example: { "quiz": [ { "question": "What is 2+2?", "answers": ["3", "4", "5"], "correctAnswer": "4" } ] }

      Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Here is the curriculum the student just completed: ${JSON.stringify(
            curriculum.map((c) => c.title)
          )}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating mastery quiz:", error.message);
    return NextResponse.json(
      { error: "Failed to generate mastery quiz." },
      { status: 500 }
    );
  }
}
