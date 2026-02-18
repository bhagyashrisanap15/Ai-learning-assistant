import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY missing in .env file");
}

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
   HELPER FUNCTION TO GENERATE TEXT
========================================================= */
const generateText = async (prompt) => {
  try {
    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash", // ✅ WORKING MODEL
      contents: prompt, // must be string
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("🔥 Gemini API Error:", error);
    throw error;
  }
};

/* =========================================================
   SAFE JSON PARSER
========================================================= */
const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON Parse Error:", err);
    throw new Error("AI returned invalid JSON format.");
  }
};

/* =========================================================
   GENERATE SUMMARY
========================================================= */
export const generateSummary = async (text) => {
  try {
    const prompt = `
You are an AI learning assistant.

Generate a clear and concise summary of the following document:

${text}
`;
    return await generateText(prompt);
  } catch (error) {
    console.error("🔥 Gemini Summary Error:", error);
    throw error;
  }
};

/* =========================================================
   CHAT WITH CONTEXT
========================================================= */
export const chatWithContext = async (question, chunks = []) => {
  try {
    if (!Array.isArray(chunks)) chunks = [];

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

    return await generateText(prompt);
  } catch (error) {
    console.error("🔥 Gemini Chat Error:", error);
    throw error;
  }
};

/* =========================================================
   GENERATE FLASHCARDS
========================================================= */
export const generateFlashcards = async (text, count = 5) => {
  try {
    const prompt = `
Generate ${count} flashcards from the following content.

Return ONLY a valid JSON array in this format:
[
  {
    "question": "Question text",
    "answer": "Answer text",
    "difficulty": "easy | medium | hard"
  }
]

CONTENT:
${text}
`;

    const result = await generateText(prompt);
    return safeJsonParse(result);
  } catch (error) {
    console.error("🔥 Gemini Flashcard Error:", error);
    throw error;
  }
};

/* =========================================================
   GENERATE QUIZ
========================================================= */
export const generateQuiz = async (text, count = 5) => {
  try {
    const prompt = `
Generate ${count} multiple choice questions from the following content.

Return ONLY a valid JSON array in this format:
[
  {
    "question": "Question text",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "Correct option"
  }
]

CONTENT:
${text}
`;

    const result = await generateText(prompt);
    return safeJsonParse(result);
  } catch (error) {
    console.error("🔥 Gemini Quiz Error:", error);
    throw error;
  }
};

/* =========================================================
   EXPLAIN CONCEPT
========================================================= */
export const explainConcept = async (concept, context = "") => {
  try {
    const prompt = `
Explain the following concept clearly and simply.

CONCEPT:
${concept}

CONTEXT:
${context}
`;
    return await generateText(prompt);
  } catch (error) {
    console.error("🔥 Gemini Explain Error:", error);
    throw error;
  }
};

console.log("Using API KEY:", process.env.GEMINI_API_KEY?.slice(0, 10));
