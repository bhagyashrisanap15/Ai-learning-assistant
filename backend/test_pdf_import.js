import { PDFParse } from "pdf-parse";

console.log("Import success");
console.log("PDFParse:", PDFParse);

try {
    const p = new PDFParse(new Uint8Array([]));
    console.log("Constructor success");
} catch (e) {
    console.log("Constructor failed:", e.message);
}
