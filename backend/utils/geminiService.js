import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.AI_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

if (!API_KEY) {
    throw new Error("AI_API_KEY (OpenRouter) missing in .env file");
}

const MODELS = [
    // Stable version of Flash 2.0 (Free)
    "google/gemini-2.0-flash-001:free",
    // Experimental version of Flash 2.0 (Free)
    "google/gemini-2.0-flash-exp:free",
    // Powerful flagship model (Free)
    "meta-llama/llama-3.3-70b-instruct:free",
    // Excellent for your MERN stack coding tasks (Free - Qwen 2.5 Coder)
    "qwen/qwen-2.5-coder-32b-instruct:free",
    // Reliable 1.5 Flash fallback
    "google/gemini-flash-1.5:free",
    // Reliable Mistral fallback
    "mistralai/mistral-7b-instruct:free",
    // Fallback that automatically picks an available free model
    "openrouter/free",
];

/* =========================================================
   HELPER FUNCTION TO GENERATE TEXT
========================================================= */
const generateText = async (prompt) => {
    for (const model of MODELS) {
        try {
            const response = await fetch(OPENROUTER_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:8000", // Optional: Your app URL
                    "X-Title": "AI Learning Assistant", // Optional: Your app name
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: "system", content: "You are a helpful AI learning assistant." },
                        { role: "user", content: prompt }
                    ],
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.warn(`⚠️ Error from OpenRouter model ${model}:`, errorData);
                if (response.status === 429) continue; // Try next model on quota limit
                throw new Error(`OpenRouter API error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || "No response generated.";
        } catch (error) {
            console.error(`❌ Failed with model ${model}:`, error.message);
            continue; // Try next model
        }
    }
    throw new Error("All models exhausted or API call failed. Check your OpenRouter account.");
};

/* =========================================================
   SAFE JSON PARSER
========================================================= */
const safeJsonParse = (text) => {
    try {
        // Remove markdown code block markers if present
        const cleanText = text.replace(/```json\n?|```\n?/g, "").trim();
        return JSON.parse(cleanText);
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

console.log(`\n\n\n Using AI_API_KEY: ${process.env.AI_API_KEY ? "CONFIGURED" : "MISSING"}\n\n\n`);
