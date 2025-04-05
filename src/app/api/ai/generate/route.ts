import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CODE_GEN_PROMPT } from "@/data/lookup";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function chatSession(
  prompt: string,
  history: string | object,
  prev_code: any
) {
  console.log("PROMPT", prompt);
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${prompt}\n\n${CODE_GEN_PROMPT} previous_code - ${prev_code} take in consideration the history
        of messages, if current prompt is a new one give a new reply else if you observer that current
        prompt is a continuation of history then answer accordingly.
        
        if you find a prompt like 'make dark mode', 'update this', anything that tells you to make changes
        or update changes so just refer previous prompts to give better results for that please refer - ${prev_code}`,
          },
        ],
      },
    ],
  });

  return response;
}

// Function to sanitize and extract JSON from text
function extractJson(text: string): any {
  try {
    // First, try to find JSON inside code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);

    if (jsonMatch && jsonMatch[1]) {
      // Try parsing the content inside code blocks
      return JSON.parse(jsonMatch[1]);
    }

    // If no code blocks or parsing failed, try to find anything that looks like JSON
    const jsonPattern = /(\{[\s\S]*\})/g;
    const possibleJson = text.match(jsonPattern);

    if (possibleJson) {
      // Try each match until one parses correctly
      for (const match of possibleJson) {
        try {
          return JSON.parse(match);
        } catch (e) {
          // Continue to next match
        }
      }
    }

    // If all else fails, try the whole text
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to extract JSON:", error);
    return null;
  }
}

export async function POST(req: NextRequest, res: NextResponse) {
  const { prompt, history, previous_code } = await req.json();

  console.log("prevvvv", previous_code);

  try {
    const resp = await chatSession(prompt, history, previous_code);
    // Extract text from the response based on the actual structure
    const candidates = resp.candidates || [];
    const textResponse = candidates[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from the response
    const jsonData = extractJson(textResponse);

    if (!jsonData) {
      console.warn("Failed to parse JSON response from AI");
      return NextResponse.json(
        {
          error: "Failed to parse JSON response",
          rawText: textResponse,
        },
        { status: 400 }
      );
    }

    // Create default files if none were provided
    if (!jsonData.files || Object.keys(jsonData.files).length === 0) {
      jsonData.files = {
        "/App.jsx": {
          code: `import React from 'react';\n\nexport default function App() {\n  return (\n    <div className="App">\n      <h1>Hello from React!</h1>\n      <p>AI couldn't generate proper code. This is a fallback.</p>\n    </div>\n  );\n}`,
        },
      };
    }

    return NextResponse.json({
      ...jsonData,
      rawText: textResponse,
    });
  } catch (err: unknown) {
    console.error("Error generating code:", err);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
