// Integration test: Crypto — AES-256-GCM encryption round-trip

import { describe, it, expect, beforeEach } from 'vitest';

describe('Crypto integration', () => {
  beforeEach(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  it('encrypt → decrypt round-trip preserves original text', async () => {
    const { encrypt, decrypt } = await import('@/lib/crypto');
    const original = 'sk-test-api-key-12345';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);

    expect(decrypted).toBe(original);
    expect(encrypted).not.toBe(original);
  });

  it('encrypt produces different ciphertext each time (random IV)', async () => {
    const { encrypt } = await import('@/lib/crypto');
    expect(encrypt('same-input')).not.toBe(encrypt('same-input'));
  });

  it('decrypt returns input as-is for non-encrypted strings (backward compat)', async () => {
    const { decrypt } = await import('@/lib/crypto');
    expect(decrypt('not-encrypted-value')).toBe('not-encrypted-value');
  });
});
