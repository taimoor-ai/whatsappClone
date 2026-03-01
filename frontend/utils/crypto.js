// utils/crypto.js
import CryptoJS from "crypto-js";

// 🔑 Use a fixed secret key (store securely in env for production)
const SECRET_KEY = "my_super_secret_key_123";

// Encrypt text
export const encryptMessage = (text) => {
  try {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  } catch (error) {
    console.log("Encryption error:", error);
    return text;
  }
};

// Decrypt text
export const decryptMessage = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.log("Decryption error:", error);
    return cipherText;
  }
};
