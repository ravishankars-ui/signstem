/**
 * ISL (Indian Sign Language) Grammar Engine
 * 
 * Translates English text structures into authentic ISL syntax rules:
 * 1. Time-First Ordering (e.g., "Tomorrow", "Yesterday" move to the front).
 * 2. Subject-Object-Verb (SOV) Structure (e.g., "I eat apple" -> "I apple eat").
 * 3. Question Marker to End (e.g., "What is your name?" -> "You name what?").
 * 4. Stop word & auxiliary removal (removes "is", "am", "are", "the", "a", "to", etc.).
 * 5. Tokenization & dictionary key matching.
 */

const TIME_MARKERS = new Set([
  'TODAY', 'TOMORROW', 'YESTERDAY', 'NOW', 'LATER', 'MORNING', 'EVENING',
  'NIGHT', 'DAILY', 'ALWAYS', 'NEVER', 'SOON', 'BEFORE', 'AFTER'
]);

const QUESTION_WORDS = new Set([
  'WHAT', 'WHERE', 'WHO', 'WHEN', 'WHY', 'HOW', 'WHICH'
]);

const STOP_WORDS = new Set([
  'IS', 'AM', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING',
  'THE', 'A', 'AN', 'TO', 'OF', 'FOR', 'AT', 'BY', 'WITH', 'DO', 'DOES', 'DID'
]);

const PRONOUNS = new Set([
  'I', 'ME', 'YOU', 'HE', 'SHE', 'IT', 'WE', 'THEY', 'MY', 'YOUR', 'HIS', 'HER', 'OUR', 'THEIR'
]);

/**
 * Transforms an English sentence string into an ordered array of ISL sign tokens.
 * 
 * @param {string} inputSentence 
 * @returns {{ tokens: Array<{token: string, isFingerspelling: boolean, label: string}>, original: string, islSyntax: string }}
 */
export function transformToISLGrammar(inputSentence) {
  if (!inputSentence || typeof inputSentence !== 'string') {
    return { tokens: [], original: '', islSyntax: '' };
  }

  const rawWords = inputSentence
    .trim()
    .replace(/[^\w\s]/gi, ' ')
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  if (rawWords.length === 0) {
    return { tokens: [], original: inputSentence, islSyntax: '' };
  }

  // 1. Separate words into categories
  const timeWords = [];
  const questionWords = [];
  const contentWords = [];

  rawWords.forEach((word) => {
    if (TIME_MARKERS.has(word)) {
      timeWords.push(word);
    } else if (QUESTION_WORDS.has(word)) {
      questionWords.push(word);
    } else if (!STOP_WORDS.has(word)) {
      contentWords.push(word);
    }
  });

  // 2. Reorder content words into Subject-Object-Verb (SOV)
  const reorderedContent = reorderSOV(contentWords);

  // 3. Assemble ISL Syntax: [TIME] + [SOV CONTENT] + [QUESTION]
  const islWords = [...timeWords, ...reorderedContent, ...questionWords];

  // If no content left after stop-word removal, fallback to raw filtered words
  const finalWords = islWords.length > 0 ? islWords : rawWords.filter(w => !STOP_WORDS.has(w));

  const tokens = finalWords.map((word) => ({
    token: word,
    isFingerspelling: false,
    label: word
  }));

  return {
    tokens,
    original: inputSentence,
    islSyntax: finalWords.join(' ')
  };
}

/**
 * Helper to reorder Subject-Verb-Object into Subject-Object-Verb
 */
function reorderSOV(words) {
  if (words.length <= 2) return words;

  const hasSubjectAtStart = PRONOUNS.has(words[0]);

  if (hasSubjectAtStart && words.length >= 3) {
    const subject = words[0];
    const rest = words.slice(1);
    
    // Move verb (first word after subject) to end
    const verb = rest[0];
    const objects = rest.slice(1);
    
    return [subject, ...objects, verb];
  }

  return words;
}

/**
 * Detects words longer than a specified character threshold (default: 6 chars)

 * 
 * @param {string} sentence 
 * @param {number} threshold 
 * @returns {Array<{ word: string, length: number, letters: string[] }>}
 */
export function detectLongWords(sentence, threshold = 6) {
  if (!sentence || typeof sentence !== 'string') return [];

  const words = sentence
    .trim()
    .replace(/[^\w\s]/gi, ' ')
    .toUpperCase()
    .split(/\s+/)
    .filter(Boolean);

  return words
    .filter((w) => w.length >= threshold && !STOP_WORDS.has(w))
    .map((w) => ({
      word: w,
      length: w.length,
      letters: w.split('')
    }));
}

/**
 * Converts a word into an array of ISL fingerspelling letter tokens.
 * 
 * @param {string} word 
 * @returns {Array<{ token: string, isFingerspelling: boolean, label: string }>}
 */
export function breakIntoFingerspelling(word) {
  if (!word) return [];
  const clean = word.toUpperCase().replace(/[^A-Z0-9]/g, '');
  return clean.split('').map((char) => ({
    token: char,
    isFingerspelling: true,
    label: `Letter ${char}`
  }));
}

export default transformToISLGrammar;

