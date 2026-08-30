/**
 * Text cleaner — removes noise from extracted text
 */
export function cleanText(text: string): string {
  if (!text) return "";

  let cleaned = text
    // Remove null bytes
    .replace(/\0/g, "")
    // Normalize line endings
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Remove excessive whitespace on lines
    .replace(/[ \t]+/g, " ")
    // Remove lines that are just whitespace or very short noise
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 2)
    .join("\n")
    // Collapse more than 2 consecutive newlines into 2
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return cleaned;
}
