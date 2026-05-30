// 3A Studio -- AES-256-GCM encryption for sensitive data (API keys)

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGO = 'aes-256-gcm';
const IV_LEN = 12;
const TAG_LEN = 16;

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY not configured. Set a 64-char hex string (32 bytes).',
    );
  }
  return Buffer.from(hex, 'hex');
}

/** Encrypt plaintext -> base64(iv + authTag + ciphertext) */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

/** Decrypt base64(iv + authTag + ciphertext) -> plaintext.
 *  Falls back to returning input as-is if decryption fails (backward compat). */
export function decrypt(ciphertext: string): string {
  try {
    const key = getKey();
    const data = Buffer.from(ciphertext, 'base64');
    if (data.length < IV_LEN + TAG_LEN + 1) return ciphertext;
    const iv = data.subarray(0, IV_LEN);
    const tag = data.subarray(IV_LEN, IV_LEN + TAG_LEN);
    const enc = data.subarray(IV_LEN + TAG_LEN);
    const decipher = createDecipheriv(ALGO, key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8');
  } catch {
    // Not encrypted yet (backward compatibility) -- return as-is
    return ciphertext;
  }
}
