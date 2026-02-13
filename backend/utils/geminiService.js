import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* =========================================================
   GENERATE FLASHCARDS
========================================================= */

export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.

Format:
Q: Question
A: Answer
D: Difficulty (easy, medium, hard)

Separate each flashcard with "___"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const flashcards = [];
    const cards = generatedText.split("___").filter((c) => c.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");

      let question = "";
      let answer = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("A:")) {
          answer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/* =========================================================
   GENERATE QUIZ
========================================================= */

export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions.

Format:
Q: Question
O1: Option 1
O2: Option 2
O3: Option 3
O4: Option 4
C: Correct option
E: Explanation
D: Difficulty (easy, medium, hard)

Separate questions with "---"

Text:
${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const generatedText = response.text;

    const quizzes = [];
    const blocks = generatedText.split("---").filter((b) => b.trim());

    for (const block of blocks) {
      const lines = block.trim().split("\n");

      let question = "";
      let options = [];
      let correctAnswer = "";
      let explanation = "";
      let difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();

        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("O")) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        quizzes.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return quizzes.slice(0, numQuestions);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate quiz");
  }
};

/* =========================================================
   GENERATE SUMMARY
========================================================= */

export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text:

${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate summary");
  }
};

/* =========================================================
   CHAT WITH CONTEXT
========================================================= */

export const chatWithContext = async (question, chunks = []) => {
 try {
        // Ensure chunks is always an array
        if (!Array.isArray(chunks)) {
            console.log("Chunks is not array:", chunks);
            chunks = [];
        }

        const context = chunks
            .map((c, i) => `[Chunk ${i + 1}]\n${c.context || c}`)
            .join("\n\n");

        const prompt = `Based on the following context from a document, analyze the context and answer the user's question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to process chat request");
    }
};

/* =========================================================
   EXPLAIN CONCEPT
========================================================= */

export const explainConcept = async (concept, context) => {
  const prompt = `Explain "${concept}" clearly based on this context:

${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to explain concept");
  }
};
