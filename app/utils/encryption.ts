import * as crypto from 'crypto';

// Secret key (In practice, store securely - e.g., environment variables)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-32-character-long-key-here!';
const IV_LENGTH = 16; // AES block size for IV is always 16 bytes

/**
 * Encrypts an object using AES-256-CBC.
 * @param data Object to encrypt
 * @returns Encrypted string
 */
export function encrypt(data: Record<string, any>): string {
  const iv = crypto.randomBytes(IV_LENGTH); // Generate a random IV
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  // Serialize object to JSON string
  const jsonString = JSON.stringify(data);

  let encrypted = cipher.update(jsonString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Return the IV and the encrypted data combined
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts an encrypted string back into the original object.
 * @param encryptedData Encrypted string
 * @returns Decrypted object
 */
export function decrypt(encryptedData: string): Record<string, any> {
  const [ivHex, encryptedString] = encryptedData.split(':'); // Separate IV from encrypted text
  const iv = Buffer.from(ivHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);

  let decrypted = decipher.update(encryptedString, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return JSON.parse(decrypted);
}
