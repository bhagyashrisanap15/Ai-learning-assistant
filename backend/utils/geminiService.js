import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

console.log("Loaded API KEY:", process.env.GEMINI_API_KEY);

if (!process.env.GEMINI_API_KEY) {
   throw new Error("GEMINI_API_KEY missing");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // ✅ stable model
});

/* =========================================================
   CHAT WITH CONTEXT (FIXED VERSION)
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

    const result = await model.generateContent(prompt);

    // ✅ IMPORTANT FIX
    const response = await result.response;
    const text = response.text();

    if (!text) {
      return "I could not generate a response.";
    }

    return text;
  } catch (error) {
    console.error("🔥 Gemini Chat Full Error:", error);

    return "AI service is temporarily unavailable. Please try again.";
  }
};
