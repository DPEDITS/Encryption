/**
 * Steganography & Invisible Utility
 * Provides methods for hiding data in plain sight.
 */

// Zero-width characters
const ZW = {
    '0': '\u200B', // zero-width space
    '1': '\u200C', // zero-width non-joiner
    '2': '\u200D', // zero-width joiner
    'S': '\uFEFF', // bit separator (zero-width no-break space)
};

const ZW_REVERSE: Record<string, string> = {
    '\u200B': '0',
    '\u200C': '1',
    '\u200D': '2',
};

/**
 * Invisible Encoding
 * Converts text to a base-3 representation using zero-width characters.
 */
export const encodeInvisible = (text: string): string => {
    return Array.from(text)
        .map(char => {
            const code = char.charCodeAt(0).toString(3);
            return Array.from(code).map(digit => ZW[digit as '0' | '1' | '2']).join('') + ZW.S;
        })
        .join('');
};

export const decodeInvisible = (invisibleStr: string): string => {
    const charBlocks = invisibleStr.split(ZW.S).filter(b => b.length > 0);
    return charBlocks
        .map(block => {
            const base3 = Array.from(block).map(zw => ZW_REVERSE[zw] || '').join('');
            return String.fromCharCode(parseInt(base3, 3));
        })
        .join('');
};

/**
 * Stealth Steganography
 * Injects encoded message between words of a cover text.
 */
const coverSentences = [
    "The weather is quite lovely today isn't it?",
    "I am planning to go for a run later this evening.",
    "Have you seen the latest movie that everyone is talking about?",
    "Coffee is better than tea in most situations.",
    "Programming is a journey of constant learning."
];

export const hideInStealth = (hiddenMessage: string): string => {
    const sentence = coverSentences[Math.floor(Math.random() * coverSentences.length)];
    const words = sentence.split(' ');
    const invisible = encodeInvisible(hiddenMessage);

    // Inject the invisible string after the first word
    if (words.length > 1) {
        words[0] = words[0] + invisible;
    }
    return words.join(' ');
};

export const extractFromStealth = (stealthStr: string): string => {
    // Extract all zero-width characters
    const zwPattern = /[\u200B-\u200D\uFEFF]/g;
    const matches = stealthStr.match(zwPattern);
    if (!matches) return "";
    return decodeInvisible(matches.join(''));
};
