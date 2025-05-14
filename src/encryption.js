import CryptoJS from 'crypto-js';

// This should be stored in environment variables
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'your-secure-encryption-key';

export const encryptPassword = (password) => {
    try {
        return CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();
    } catch (error) {
        console.error('Error encrypting password:', error);
        throw new Error('Failed to encrypt password');
    }
};

export const decryptPassword = (encryptedPassword) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Error decrypting password:', error);
        throw new Error('Failed to decrypt password');
    }
};