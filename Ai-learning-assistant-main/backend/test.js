import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function test() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: "Hello, are you working?",
    });

    console.log(response.text);
  } catch (error) {
    console.error("ERROR:", error);
  }
}

test();
