import { extractTextFromPDF } from "./utils/pdfParser.js";
import { chunkText, findRelevantChunks } from "./utils/textChunker.js";
import fs from "fs/promises";
import path from "path";

const runTest = async () => {
    try {
        const resultLogs = [];
        const log = (msg) => { console.log(msg); resultLogs.push(msg); };

        log("Starting verification...");

        // Create a dummy PDF file for testing (or just try to read an existing one if available)
        // Since generating a valid PDF binary is hard without a library, we'll try to use an existing one in 'uploads' if possible,
        // or just mock the fs.readFile for the purpose of testing the logic flow if we can't find one.
        // Actually, let's just create a dummy file and see if PDFParse throws a specific error or if we can mock it.
        // But better: let's test chunker logic directly first.

        log("Testing Chunker Logic...");
        const text = "This is a test document. It has some content about PDF parsing. " + "Word ".repeat(200) + "End of document.";
        const chunks = chunkText(text, 50, 10);
        log(`Generated ${chunks.length} chunks.`);

        const query = "irrelevant query";
        const relevant = findRelevantChunks(chunks, query, 3);
        log(`Query: ${query}`);
        log(`Relevant chunks found: ${relevant.length}`);
        if (relevant.length > 0) {
            log("Fallback logic working: YES");
            log(`First chunk content: ${relevant[0].content.substring(0, 50)}...`);
        } else {
            log("Fallback logic working: NO (No chunks returned)");
        }

        const query2 = "PDF parsing";
        const relevant2 = findRelevantChunks(chunks, query2, 3);
        log(`Query: ${query2}`);
        log(`Relevant chunks found: ${relevant2.length}`);
        if (relevant2.length > 0 && relevant2[0].content.includes("PDF parsing")) {
            log("Keyword matching working: YES");
        } else {
            log("Keyword matching working: NO");
        }

        log("\nVerification complete.");
        await fs.writeFile("verification_result.txt", resultLogs.join("\n"));

    } catch (error) {
        console.error("Verification failed:", error);
        await fs.writeFile("verification_result.txt", `Verification failed: ${error.message}`);
    }
};

runTest();
