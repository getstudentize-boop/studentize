/**
 * Recursively extracts text content from Tiptap JSON structure
 */
export function extractTextFromTiptap(content: any): string {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromTiptap).join(" ");
  }

  if (typeof content === "object") {
    // Extract text from content array if it exists
    if (content.content && Array.isArray(content.content)) {
      return content.content.map(extractTextFromTiptap).join(" ");
    }
    // Extract text property if it exists
    if (content.text) {
      return content.text;
    }
  }

  return "";
}

/**
 * Counts words in a text string
 */
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0;
  // Remove extra whitespace and split by spaces, then filter out empty strings
  return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
}

/**
 * Counts words in Tiptap JSON content
 */
export function countWordsInTiptap(content: any): number {
  const text = extractTextFromTiptap(content);
  return countWords(text);
}
