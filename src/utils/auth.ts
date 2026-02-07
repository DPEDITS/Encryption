/**
 * Auth Utility: Master Password & Data Encryption
 * Uses Web Crypto API for secure, zero-knowledge encryption.
 */

const SALT = 'ENCRYPT_MASTER_SALT_V1'; // In production, this can be unique per user
const ITERATIONS = 100000;
const KEY_LENGTH = 256;

/**
 * Generate a CryptoKey from a master password.
 */
export const deriveKeyFromPassword = async (password: string): Promise<CryptoKey> => {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
    );

    return window.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: encoder.encode(SALT),
            iterations: ITERATIONS,
            hash: 'SHA-256',
        },
        passwordKey,
        { name: 'AES-GCM', length: KEY_LENGTH },
        false,
        ['encrypt', 'decrypt']
    );
};

/**
 * Encrypt data using a CryptoKey.
 */
export const encryptData = async (data: string, key: CryptoKey): Promise<string> => {
    const encoder = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(data)
    );

    // Combine IV and Encrypted data for storage
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    // Convert to Base64 for storage
    return btoa(String.fromCharCode(...combined));
};

/**
 * Decrypt data using a CryptoKey.
 */
export const decryptData = async (encryptedBase64: string, key: CryptoKey): Promise<string> => {
    const combined = new Uint8Array(
        atob(encryptedBase64).split('').map(c => c.charCodeAt(0))
    );
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
    );

    return new TextDecoder().decode(decrypted);
};

/**
 * Shared Encoding Utility for URLs
 */
export const toBase64 = (str: string): string => {
    try {
        return btoa(unescape(encodeURIComponent(str)));
    } catch (e) {
        return btoa(str);
    }
};

export const fromBase64 = (str: string): string => {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch (e) {
        return atob(str);
    }
};
