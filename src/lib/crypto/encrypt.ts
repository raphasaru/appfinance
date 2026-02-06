import { ALGO, IV_LENGTH } from "./constants";

/**
 * Import a raw base64-encoded key as a CryptoKey for AES-GCM.
 */
export async function importKey(base64Key: string): Promise<CryptoKey> {
  const raw = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));
  return crypto.subtle.importKey("raw", raw, { name: ALGO }, false, [
    "encrypt",
    "decrypt",
  ]);
}

/**
 * Encrypt a string value → base64 ciphertext (IV prepended).
 */
export async function encryptField(
  value: string,
  key: CryptoKey
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encoded = new TextEncoder().encode(value);
  const cipherBuf = await crypto.subtle.encrypt(
    { name: ALGO, iv },
    key,
    encoded
  );
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + cipherBuf.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(cipherBuf), iv.length);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a base64 ciphertext → original string.
 */
export async function decryptField(
  ciphertext: string,
  key: CryptoKey
): Promise<string> {
  const combined = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  const iv = combined.slice(0, IV_LENGTH);
  const data = combined.slice(IV_LENGTH);
  const plainBuf = await crypto.subtle.decrypt(
    { name: ALGO, iv },
    key,
    data
  );
  return new TextDecoder().decode(plainBuf);
}
