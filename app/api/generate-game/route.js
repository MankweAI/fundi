import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const systemPrompt = `You are an expert educational tool. Your task is to analyze homework and structure it into a specific JSON format.
      
      RULES:
      1.  Identify introductory text or context statements (e.g., "Consider the following...", "Read the passage...") and DO NOT classify them as questions.
      2.  Group related sub-questions (e.g., 1.1, 1.2, 1.3) under a single "pack".
      3.  The final output must be a JSON object with a single key "questions", which is an array.
      4.  Items in the array can be EITHER a single question object OR a "pack" object.
      
      JSON STRUCTURES:
      -   For a single question: { "id": "q1", "label": "Question 1", "text": "What is the capital of Kenya?" }
      -   For a pack of sub-questions: { "id": "q2_pack", "label": "Question 2 Pack", "subQuestions": [ { "id": "q2_1", "label": "2.1", "text": "First part..." }, { "id": "q2_2", "label": "2.2", "text": "Second part..." } ] }
      
      Each question object, whether standalone or in a pack, MUST have "id", "label", and "text". A pack object MUST have "id", "label", and a "subQuestions" array.
      The output must be ONLY the raw JSON.`;

    let userContent = [];
    let model = "gpt-3.5-turbo";

    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const base64Image = buffer.toString("base64");
      userContent = [
        { type: "text", text: "Here is the homework image:" },
        {
          type: "image_url",
          image_url: { url: `data:${imageFile.type};base64,${base64Image}` },
        },
      ];
      model = "gpt-4o"; // Use vision model for images
    } else {
      userContent = [
        { type: "text", text: `Here is the homework text: ${textInput}` },
      ];
    }

    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message.content;
    const parsedJson = JSON.parse(responseText);

    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Error in generate-game API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate game data." },
      { status: 500 }
    );
  }
}
