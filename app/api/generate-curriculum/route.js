import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { painPoint } = await request.json();
    // --- TONE CHANGE: Updated prompt for a friendlier persona ---
    const systemPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa, like a cool older sibling helping with homework. Your language must be very simple, clear, and positive, like you're explaining things to a 10-year-old. A student is struggling with a topic. Your task is to take their "pain point" and create a personalized, step-by-step curriculum to help them master it.

    The output must be a JSON object with a single key "curriculum", which is an array of objective objects. Each objective must have "id" (a simple string like "step_1"), and "title" (a concise learning goal).

    The curriculum should have between 3 and 5 logical, ordered steps. Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `My pain point is: "${painPoint}"` },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating curriculum:", error.message);
    return NextResponse.json(
      { error: "Failed to generate curriculum." },
      { status: 500 }
    );
  }
}
