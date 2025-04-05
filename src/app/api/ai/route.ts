import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const systemPrompt = "You are an AI assistant.";

async function chatSession(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      { role: "user", parts: [{ text: `${systemPrompt}\n\n${prompt}` }] },
    ],
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getServerSession(authOptions);

    if (!auth) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { prompt } = await req.json();
    const response = await chatSession(prompt);

    return NextResponse.json({ response }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
