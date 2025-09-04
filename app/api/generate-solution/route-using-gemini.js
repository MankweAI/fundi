import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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
    const prompt = `You are an expert South African high school tutor. Analyze the provided homework problem(s). For each question you find, provide a clear, detailed, step-by-step solution. Format your response clearly with headings for each question. The output should be a single block of text that is easy to read. Here is the homework:`;

    const handleGeneration = async (content) => {
      const result = await model.generateContent(content);
      const response = await result.response;
      return response.text();
    };

    let solutionText;
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imagePart = await fileToGenerativePart(buffer, imageFile.type);
      solutionText = await handleGeneration([prompt, imagePart]);
    } else {
      solutionText = await handleGeneration([prompt, textInput]);
    }

    return NextResponse.json({ solutionText });
  } catch (error) {
    console.error("Error in generate-solution API:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate solution." },
      { status: 500 }
    );
  }
}
