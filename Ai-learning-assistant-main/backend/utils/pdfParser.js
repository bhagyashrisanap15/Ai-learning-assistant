import fs from "fs/promises";
import { PDFParse } from "pdf-parse";

/**
 * 
 * @param {string} filePath 
 * @returns {Promise<{text:string,numPages:number}>}
 */

export const extractTextFromPDF = async (filePath) => {
    try{
        const dataBuffer = await  fs.readFile(filePath);
        const parse = new PDFParse(new Uint8Array(dataBuffer));
        const data = await parse.getText();

        return{
            text:data.text,
            numPage:data.numPages,
            info:data.info,
        };
    } catch (error){
        console.error("PDF parsing error:",error);
        throw new Error("Failed to extract text from PDF");
    }
};

