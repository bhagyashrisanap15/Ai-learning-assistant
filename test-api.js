import { generateSummary } from './backend/utils/geminiService.js';

async function testApi() {
    console.log("Testing OpenRouter API integration...");
    try {
        const summary = await generateSummary("This is a test document to verify the AI service integration.");
        console.log("✅ Success! AI Response:", summary);
    } catch (error) {
        console.error("❌ API Test Failed:", error.message);
    }
}

testApi();
