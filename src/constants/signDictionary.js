/**
 * Indian Sign Language (ISL) 2D Asset Dictionary & Sequencer Mappings
 * 
 * Supports:
 * - Direct word / phrase mapping to transparent .webm or .json Lottie assets
 * - Full A-Z & 0-9 Fingerspelling fallback
 * - Idle / Neutral rest loop state
 */

export const ASSET_BASE_PATH = '/assets';

// 1. ISL Words and Phrases Dictionary
export const SIGN_DICTIONARY = {
  'HELLO': `${ASSET_BASE_PATH}/signs/hello.webm`,
  'NAMASTE': `${ASSET_BASE_PATH}/signs/namaste.webm`,
  'YOU': `${ASSET_BASE_PATH}/signs/you.webm`,
  'ME': `${ASSET_BASE_PATH}/signs/me.webm`,
  'I': `${ASSET_BASE_PATH}/signs/me.webm`,
  'HOW': `${ASSET_BASE_PATH}/signs/how.webm`,
  'WHAT': `${ASSET_BASE_PATH}/signs/what.webm`,
  'WHERE': `${ASSET_BASE_PATH}/signs/where.webm`,
  'WHEN': `${ASSET_BASE_PATH}/signs/when.webm`,
  'WHY': `${ASSET_BASE_PATH}/signs/why.webm`,
  'NAME': `${ASSET_BASE_PATH}/signs/name.webm`,
  'GOOD': `${ASSET_BASE_PATH}/signs/good.webm`,
  'MORNING': `${ASSET_BASE_PATH}/signs/morning.webm`,
  'EVENING': `${ASSET_BASE_PATH}/signs/evening.webm`,
  'NIGHT': `${ASSET_BASE_PATH}/signs/night.webm`,
  'THANK_YOU': `${ASSET_BASE_PATH}/signs/thank_you.webm`,
  'THANKS': `${ASSET_BASE_PATH}/signs/thank_you.webm`,
  'WELCOME': `${ASSET_BASE_PATH}/signs/welcome.webm`,
  'PLEASE': `${ASSET_BASE_PATH}/signs/please.webm`,
  'HELP': `${ASSET_BASE_PATH}/signs/help.webm`,
  'YES': `${ASSET_BASE_PATH}/signs/yes.webm`,
  'NO': `${ASSET_BASE_PATH}/signs/no.webm`,
  'DEAF': `${ASSET_BASE_PATH}/signs/deaf.webm`,
  'HEARING': `${ASSET_BASE_PATH}/signs/hearing.webm`,
  'LEARN': `${ASSET_BASE_PATH}/signs/learn.webm`,
  'SIGN': `${ASSET_BASE_PATH}/signs/sign.webm`,
  'LANGUAGE': `${ASSET_BASE_PATH}/signs/language.webm`,
  'INDIA': `${ASSET_BASE_PATH}/signs/india.webm`,
  'FRIEND': `${ASSET_BASE_PATH}/signs/friend.webm`,
  'FAMILY': `${ASSET_BASE_PATH}/signs/family.webm`,
  'TIME': `${ASSET_BASE_PATH}/signs/time.webm`,
  'TODAY': `${ASSET_BASE_PATH}/signs/today.webm`,
  'TOMORROW': `${ASSET_BASE_PATH}/signs/tomorrow.webm`,
  'WATER': `${ASSET_BASE_PATH}/signs/water.webm`,
  'FOOD': `${ASSET_BASE_PATH}/signs/food.webm`,
  'STOP': `${ASSET_BASE_PATH}/signs/stop.webm`
};

// 2. ISL Fingerspelling (Single Hand / Double Hand Alphabet A-Z & 0-9)
export const ALPHABET_DICTIONARY = Array.from({ length: 26 }, (_, i) => {
  const char = String.fromCharCode(65 + i); // 'A' - 'Z'
  return [char, `${ASSET_BASE_PATH}/letters/${char.toLowerCase()}.webm`];
}).reduce((acc, [char, path]) => {
  acc[char] = path;
  return acc;
}, {
  // Numbers 0-9
  '0': `${ASSET_BASE_PATH}/numbers/0.webm`,
  '1': `${ASSET_BASE_PATH}/numbers/1.webm`,
  '2': `${ASSET_BASE_PATH}/numbers/2.webm`,
  '3': `${ASSET_BASE_PATH}/numbers/3.webm`,
  '4': `${ASSET_BASE_PATH}/numbers/4.webm`,
  '5': `${ASSET_BASE_PATH}/numbers/5.webm`,
  '6': `${ASSET_BASE_PATH}/numbers/6.webm`,
  '7': `${ASSET_BASE_PATH}/numbers/7.webm`,
  '8': `${ASSET_BASE_PATH}/numbers/8.webm`,
  '9': `${ASSET_BASE_PATH}/numbers/9.webm`,
});

// 3. Neutral Idle Loop Animation
export const IDLE_ASSET = {
  id: 'idle-loop',
  token: 'IDLE',
  label: 'Resting / Idle',
  src: `${ASSET_BASE_PATH}/idle.webm`,
  type: 'IDLE',
  isIdle: true,
  isFingerspelling: false
};

/**
 * Resolves an incoming array of raw tokens into a sequential queue of playable items.
 * If a token is in the dictionary -> single word queue item.
 * If NOT in the dictionary -> fingerspells each letter sequentially.
 * 
 * @param {string[]|string} inputTokens - e.g. ['HELLO', 'RAVI', 'HOW', 'YOU']
 * @returns {Array<PlayableQueueItem>}
 */
export function resolveTokensToQueue(inputTokens) {
  if (!inputTokens) return [];

  const rawList = Array.isArray(inputTokens)
    ? inputTokens
    : typeof inputTokens === 'string'
    ? inputTokens.split(/[\s,]+/)
    : [];

  const queue = [];

  rawList.forEach((rawToken) => {
    if (!rawToken || typeof rawToken !== 'string') return;

    // Normalize: uppercase, remove non-alphanumeric punctuation except underscores
    const sanitized = rawToken.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!sanitized) return;

    // Check direct word match
    if (SIGN_DICTIONARY[sanitized]) {
      queue.push({
        id: `word-${sanitized}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        token: sanitized,
        label: sanitized.replace(/_/g, ' '),
        src: SIGN_DICTIONARY[sanitized],
        type: 'WORD',
        isFingerspelling: false,
        wordRef: sanitized
      });
    } else {
      // Fingerspelling Fallback: decompose into individual character animations
      const chars = sanitized.split('');
      chars.forEach((char, index) => {
        const letterSrc = ALPHABET_DICTIONARY[char] || `${ASSET_BASE_PATH}/letters/unknown.webm`;
        queue.push({
          id: `letter-${char}-${index}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          token: char,
          label: `${char}`,
          src: letterSrc,
          type: 'FINGERSPELLED_LETTER',
          isFingerspelling: true,
          wordRef: sanitized,
          letterIndex: index,
          totalLetters: chars.length
        });
      });
    }
  });

  return queue;
}
