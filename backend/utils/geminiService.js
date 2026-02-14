import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing");
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
   CHAT WITH CONTEXT (CORRECT NEW SDK)
========================================================= */
export const chatWithContext = async (question, chunks = []) => {
  try {
    if (!Array.isArray(chunks)) {
      chunks = [];
    }

    const context = chunks
      .map((c) => c.content || c)
      .join("\n\n");

    const prompt = `
You are an AI learning assistant.

Use the context below to answer the question.

CONTEXT:
${context || "No context provided."}

QUESTION:
${question}

If answer is not found in context, say:
"I cannot find this in the document."
`;

    const response = await genAI.models.generateContent({
      model: "gemini-1.5-flash-latest",
      contents: prompt,
    });

    return response.text;

  } catch (error) {
    console.error("🔥 Gemini Chat Full Error:", error);
    return "AI service is temporarily unavailable. Please try again.";
  }
};
