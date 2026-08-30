import * as fs from "fs";
import * as path from "path";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

interface ExtractionResult {
  pages: ExtractedPage[];
  totalPages: number;
  fullText: string;
}

export async function extractText(filePath: string, fileType: string): Promise<ExtractionResult> {
  const ext = fileType.toLowerCase();

  if (ext === "pdf" || ext === "application/pdf") {
    return extractFromPdf(filePath);
  } else if (ext === "docx" || ext === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    return extractFromDocx(filePath);
  } else if (ext === "txt" || ext === "text/plain") {
    return extractFromTxt(filePath);
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function extractFromPdf(filePath: string): Promise<ExtractionResult> {
  const pdfParse = require("pdf-parse");
  const dataBuffer = fs.readFileSync(filePath);

  let fullText = "";
  let numPages = 1;

  try {
    const data = await pdfParse(dataBuffer);
    fullText = data.text || "";
    numPages = data.numpages || 1;
  } catch (err: any) {
    console.error("[TextExtractor] PDF parse error:", err);
    throw new Error(`Failed to extract text from PDF: ${err.message || err}`);
  }

  const pages: ExtractedPage[] = [];
  if (fullText.trim().length > 0) {
    const textPerPage = Math.ceil(fullText.length / Math.max(1, numPages));
    for (let i = 0; i < numPages; i++) {
      const pageText = fullText.substring(i * textPerPage, (i + 1) * textPerPage).trim();
      if (pageText) {
        pages.push({ pageNumber: i + 1, text: pageText });
      }
    }
  }

  if (pages.length === 0) {
    pages.push({ pageNumber: 1, text: fullText });
  }

  return { pages, totalPages: numPages, fullText };
}

async function extractFromDocx(filePath: string): Promise<ExtractionResult> {
  const mammoth = require("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  const fullText = result.value || "";

  const pages: ExtractedPage[] = [{ pageNumber: 1, text: fullText }];
  return { pages, totalPages: 1, fullText };
}

async function extractFromTxt(filePath: string): Promise<ExtractionResult> {
  const fullText = fs.readFileSync(filePath, "utf-8");
  const pages: ExtractedPage[] = [{ pageNumber: 1, text: fullText }];
  return { pages, totalPages: 1, fullText };
}
