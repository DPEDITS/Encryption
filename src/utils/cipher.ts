/**
 * Emoji Cipher Utility (Keyed)
 * A fun-level encryption tool mapping characters to unique emojis.
 * Supports deterministic randomization based on a security key.
 */

const baseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .!?-+=()@#$%& \n";
const baseEmojis = [
    '😀', '😂', '😎', '😍', '🥳', '🤔', '👻', '🤡', '🚀', '🌈',
    '🦄', '🍉', '🍕', '🎸', '🔥', '💎', '👑', '🤖', '🐱', '🐶',
    '🍦', '🍩', '🌮', '🍔', '🥑', '🧩', '🌱', '🌍', '☀️', '🌙',
    '⭐', '🎈', '🎁', '🎨', '📸', '🎭', '🎮', '🎵', '📖', '✏️',
    '💡', '🗝️', '🛡️', '🏹', '🔭', '🛸', '🧬', '🌋', '🌊', '🌪️',
    '⚡', '✨', '🍎', '🍌', '🍊', '🍓', '🍒', '🍍', '🥝', '🍇',
    '🍈', '🍐', '⚪', '🔹', '🔸', '❕', '❓', '➖', '➕', '🟰',
    '⬅️', '➡️', '📧', '🔢', '💲', '📈', '🔗', '⬛'
];

// Seeded PRNG (Mulberry32)
const mulberry32 = (a: number) => {
    return () => {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

// Deterministic Hash for Key
const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// Generate Keyed Mapping
const getMappings = (key: string) => {
    const seed = hashString(key || "default");
    const random = mulberry32(seed);

    const shuffledEmojis = [...baseEmojis];
    // Fisher-Yates shuffle with seeded random
    for (let i = shuffledEmojis.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [shuffledEmojis[i], shuffledEmojis[j]] = [shuffledEmojis[j], shuffledEmojis[i]];
    }

    const charToEmoji: Record<string, string> = {};
    const emojiToChar: Record<string, string> = {};

    Array.from(baseChars).forEach((char, index) => {
        const emoji = shuffledEmojis[index] || '❓';
        charToEmoji[char] = emoji;
        emojiToChar[emoji] = char;
    });

    return { charToEmoji, emojiToChar };
};

export const encrypt = (text: string, key: string): string => {
    const { charToEmoji } = getMappings(key);
    return Array.from(text)
        .map(char => charToEmoji[char] || char)
        .join('');
};

export const decrypt = (emojiText: string, key: string): string => {
    const { emojiToChar } = getMappings(key);
    const emojis = Array.from(emojiText);

    // Need to handle multi-character emojis correctly
    // Array.from splits correctly into surrogate pairs
    return emojis
        .map(emoji => emojiToChar[emoji] || emoji)
        .join('');
};

export const calculateSecurityMetrics = (text: string, key: string) => {
    const entropyPerChar = key.length > 0 ? Math.log2(baseEmojis.length) : 5.8;
    const totalEntropy = text.length * entropyPerChar;

    const complexity = Math.min(100, (key.length * 10) + (text.length > 0 ? 20 : 0));

    const trials = Math.pow(2, totalEntropy);
    const secondsToCrack = trials / 1e9;

    let crackTimeStr = "";
    if (secondsToCrack < 60) crackTimeStr = "Seconds";
    else if (secondsToCrack < 3600) crackTimeStr = "Minutes";
    else if (secondsToCrack < 86400) crackTimeStr = "Days";
    else if (secondsToCrack < 31536000) crackTimeStr = "Months";
    else if (secondsToCrack < 31536000000) crackTimeStr = "Years";
    else crackTimeStr = "Centuries";

    return {
        entropy: Math.round(totalEntropy),
        complexity,
        crackTime: crackTimeStr,
        strength: complexity > 70 ? 'Ultra' : complexity > 40 ? 'High' : 'Moderate'
    };
};
