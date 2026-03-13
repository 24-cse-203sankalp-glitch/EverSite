import CryptoJS from 'crypto-js';

class MessageEncryption {
  constructor() {
    this.key = this.generateKey();
  }

  generateKey() {
    const stored = localStorage.getItem('encryption-key');
    if (stored) return stored;
    
    const newKey = CryptoJS.lib.WordArray.random(256/8).toString();
    localStorage.setItem('encryption-key', newKey);
    return newKey;
  }

  encrypt(message) {
    return CryptoJS.AES.encrypt(JSON.stringify(message), this.key).toString();
  }

  decrypt(encryptedMessage) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, this.key);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  hashMessage(message) {
    return CryptoJS.SHA256(message).toString();
  }
}

export default new MessageEncryption();
