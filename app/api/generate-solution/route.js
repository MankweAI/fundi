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

    const systemPrompt = `You are an expert South African high school tutor. Analyze the provided homework problem(s). For each question you find, provide a clear, detailed, step-by-step solution. Format your response clearly with headings for each question. The output should be a single block of text that is easy to read.`;

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
      model = "gpt-4o";
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
    });

    const solutionText = completion.choices[0].message.content;

    return NextResponse.json({ solutionText });
  } catch (error) {
    console.error("Error in generate-solution API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate solution." },
      { status: 500 }
    );
  }
}

