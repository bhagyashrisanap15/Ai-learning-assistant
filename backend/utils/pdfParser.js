import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * 
 * @param {string} filePath 
 * @returns {Promise<{text:string,numPages:number}>}
 */

export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        // Correctly instantiate with an options object containing the data
        const parse = new PDFParse({ data: dataBuffer });

        // getText() returns a TextResult which contains the .text property
        const data = await parse.getText();

        return {
            text: data.text,
            // numPages and info are not directly available on TextResult, 
            // and are not used by the controller, so omitting them for now.
            // If needed, we would call parse.getInfo() separately.
        };
    } catch (error) {
        console.error("PDF parsing error:", error);
        throw new Error("Failed to extract text from PDF");
    }
};

