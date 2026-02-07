import { encrypt, decrypt } from './src/utils/cipher.js';

const testCases = [
    "Hello World!",
    "Vite + React = 🚀",
    "1234567890",
    "Special characters: @#$%^&*()",
    "Newline\nTest"
];

console.log("--- Emoji Cipher Test ---");

testCases.forEach(text => {
    const enc = encrypt(text);
    const dec = decrypt(enc);
    console.log(`Original: ${text}`);
    console.log(`Encrypted: ${enc}`);
    console.log(`Decrypted: ${dec}`);
    if (text === dec) {
        console.log("✅ Success");
    } else {
        console.log("❌ Failed");
    }
    console.log("---");
});
