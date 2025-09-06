import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request) {
  try {
    const { objectiveTitle } = await request.json();
    // --- TONE CHANGE: Prompt now enforces better formatting for retention ---
    const systemPrompt = `You are a fun, friendly, and super encouraging AI tutor from South Africa. Your language must be very simple, clear, and positive, like you're explaining things to a 10-year-old.

      Your task is to create a learning module for a specific objective. This module has three parts: a text lesson, an optional visual aid, and a challenge question.

      RULES FOR THE "lesson" TEXT:
      1.  Structure the lesson for maximum readability and retention. Use very short paragraphs (1-2 sentences).
      2.  Use bullet points or numbered lists to break down information.
      3.  Emphasize *key terms* by placing asterisks around them. This is important!
      4.  The tone should be super friendly and encouraging.

      RULES FOR THE "visual" OBJECT:
      - Decide if a visual would help. For math formulas, use 'latex_expression'. For graphs, use 'chartjs'. For color-coding, use 'html_expression'. If none, set to null.
      - When you provide a visual, the lesson text must refer to it (e.g., "Look at the picture below..."). **Do not** include the raw formula in the lesson text itself if it's in a visual.

      The final output MUST be a JSON object with the structure:
      { "lesson": "Your well-formatted lesson text...", "visual": { ... }, "challenge": "..." }

      Output only the raw JSON.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `The learning objective is: "${objectiveTitle}"`,
        },
      ],
      response_format: { type: "json_object" },
    });
    const responseText = completion.choices[0].message.content;
    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("Error generating lesson:", error.message);
    return NextResponse.json(
      { error: "Failed to generate lesson." },
      { status: 500 }
    );
  }
}
