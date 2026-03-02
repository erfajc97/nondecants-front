import CryptoJS from 'crypto-js';

const SECRET_KEY = import.meta.env.VITE_SECRET_KEY || 'nondecants-default-key';

const isClient = typeof localStorage !== 'undefined';

// Wrapper sobre localStorage con encriptado AES.
// SSR-safe: retorna null / no-op cuando localStorage no está disponible.
const secureStorage = {
  setItem(key: string, value: string): void {
    if (!isClient) return;
    const encryptedKey = CryptoJS.SHA256(key + SECRET_KEY).toString();
    const encryptedValue = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
    localStorage.setItem(encryptedKey, encryptedValue);
  },

  getItem(key: string): string | null {
    if (!isClient) return null;
    const encryptedKey = CryptoJS.SHA256(key + SECRET_KEY).toString();
    const encryptedValue = localStorage.getItem(encryptedKey);
    if (!encryptedValue) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedValue, SECRET_KEY);
      return bytes.toString(CryptoJS.enc.Utf8) || null;
    } catch {
      return null;
    }
  },

  removeItem(key: string): void {
    if (!isClient) return;
    const encryptedKey = CryptoJS.SHA256(key + SECRET_KEY).toString();
    localStorage.removeItem(encryptedKey);
  },

  clear(): void {
    if (!isClient) return;
    localStorage.clear();
  },
};

export { secureStorage };
export default secureStorage;
