import { Buffer } from "buffer";

// Ensure global.Buffer is set for crypto-js
global.Buffer = global.Buffer || Buffer;

const SECRET_KEY = process.env.EXPO_PUBLIC_SECRET_KEY; // Use an environment variable!

export const encryptMessage = (text) => {
  try {
    // Encrypt returns a CipherParams object, ensure you convert to string
    // return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
    return text;
  } catch (error) {
    console.error("Encryption error:", error);
    return null; // Return null instead of plaintext on failure
  }
};

// Decrypt text
export const decryptMessage = (cipherText) => {
  try {
    // const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    // return bytes.toString(CryptoJS.enc.Utf8);
    return cipherText;
  } catch (error) {
    console.log("Decryption error:", error);
    return cipherText;
  }
};
