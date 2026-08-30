export interface Chunk {
  text: string;
  pageNumber: number;
  chunkIndex: number;
  documentId: number;
  documentName: string;
}

interface Page {
  pageNumber: number;
  text: string;
}

const CHUNK_SIZE = 800;       // characters per chunk
const CHUNK_OVERLAP = 150;    // overlap between chunks

/**
 * Split pages into overlapping text chunks
 */
export function chunkPages(
  pages: Page[],
  documentId: number,
  documentName: string
): Chunk[] {
  const chunks: Chunk[] = [];
  let globalIndex = 0;

  for (const page of pages) {
    const text = page.text;
    if (!text || text.trim().length < 10) continue;

    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + CHUNK_SIZE, text.length);
      const chunkText = text.substring(start, end).trim();

      if (chunkText.length > 20) {
        chunks.push({
          text: chunkText,
          pageNumber: page.pageNumber,
          chunkIndex: globalIndex++,
          documentId,
          documentName,
        });
      }

      if (end === text.length) break;
      start = end - CHUNK_OVERLAP;
    }
  }

  return chunks;
}
