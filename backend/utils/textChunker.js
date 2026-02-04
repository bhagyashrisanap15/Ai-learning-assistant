/**
 * Split text into overlapping chunks
 * @param {string} text
 * @param {number} chunkSize
 * @param {number} overlap
 * @returns {Array<{ content: string, chunkIndex: number, pageNumber: number }>}
 */
export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+/g, " ")
    .replace(/\n /g, "\n")
    .replace(/ \n /g, "\n")
    .trim();

  const paragraphs = cleanedText
    .split(/\n+/)
    .filter(p => p.trim().length > 0);

  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // Paragraph larger than chunk size → split directly
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      for (let i = 0; i < paragraphWords.length; i += (chunkSize - overlap)) {
        const chunkWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunkWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0
        });

        if (i + chunkSize >= paragraphWords.length) break;
      }
      continue;
    }

    // Current chunk overflow → flush
    if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });

      const prevWords = currentChunk.join(" ").split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount =
        overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex++,
      pageNumber: 0
    });
  }

  // Fallback if nothing chunked
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += (chunkSize - overlap)) {
      chunks.push({
        content: allWords.slice(i, i + chunkSize).join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0
      });
      if (i + chunkSize >= allWords.length) break;
    }
  }

  return chunks;
};

/**
 * Find most relevant chunks for a query
 * @param {Array<Object>} chunks
 * @param {string} query
 * @param {number} maxChunks
 * @returns {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query) {
    return [];
  }

  const stopWords = new Set([
    "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
    "in", "with", "to", "for", "of", "as", "by", "this", "that", "it"
  ]);

  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    return chunks.slice(0, maxChunks);
  }

  const scoredChunks = chunks.map((chunk, index) => {
    const content = chunk.content.toLowerCase();
    const contentWordCount = content.split(/\s+/).length;

    let score = 0;
    let matchedWords = 0;

    for (const word of queryWords) {
      const matches = (content.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
      if (matches > 0) {
        score += matches * 2;
        matchedWords++;
      }
    }

    const normalizedScore = score / Math.sqrt(contentWordCount);
    const positionBonus = 1 - (index / chunks.length) * 0.1;

    return {
      ...chunk,
      score: normalizedScore * positionBonus,
      matchedWords
    };
  });

  return scoredChunks
    .filter(c => c.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.matchedWords !== a.matchedWords) return b.matchedWords - a.matchedWords;
      return a.chunkIndex - b.chunkIndex;
    })
    .slice(0, maxChunks);
};







