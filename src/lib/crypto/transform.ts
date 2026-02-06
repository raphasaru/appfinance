import { encryptField, decryptField } from "./encrypt";
import { ENCRYPTED_FIELDS } from "./schemas";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Encrypt all sensitive fields of a row before writing to DB.
 * Returns a new object with encrypted values as base64 strings.
 */
export async function encryptRow(
  table: string,
  row: any,
  key: CryptoKey
): Promise<any> {
  const schema = ENCRYPTED_FIELDS[table];
  if (!schema) return row;

  const result = { ...row };
  for (const field of Object.keys(schema)) {
    const value = result[field];
    if (value == null) continue;
    result[field] = await encryptField(String(value), key);
  }
  return result;
}

/**
 * Decrypt all sensitive fields of a row after reading from DB.
 * Restores numbers and strings to their original types.
 */
export async function decryptRow(
  table: string,
  row: any,
  key: CryptoKey
): Promise<any> {
  const schema = ENCRYPTED_FIELDS[table];
  if (!schema) return row;

  const result = { ...row };
  for (const [field, type] of Object.entries(schema)) {
    const value = result[field];
    if (value == null || typeof value !== "string") continue;
    // Skip if it looks like a plaintext number (migration fallback)
    if (type === "number" && !isNaN(Number(value)) && !value.includes("=")) {
      result[field] = Number(value);
      continue;
    }
    // Skip if it looks like plaintext string (no base64 padding pattern)
    if (type === "string" && !looksEncrypted(value)) continue;
    try {
      const decrypted = await decryptField(value, key);
      result[field] = type === "number" ? Number(decrypted) : decrypted;
    } catch {
      // Fallback: value might still be plaintext (pre-migration)
      if (type === "number") {
        result[field] = Number(value) || 0;
      }
    }
  }
  return result;
}

/**
 * Decrypt an array of rows.
 */
export async function decryptRows(
  table: string,
  rows: any[],
  key: CryptoKey
): Promise<any[]> {
  return Promise.all(rows.map((row) => decryptRow(table, row, key)));
}

/**
 * Heuristic: base64-encoded ciphertext is typically 24+ chars with base64 alphabet.
 * Plaintext descriptions are unlikely to match this pattern.
 */
function looksEncrypted(value: string): boolean {
  if (value.length < 20) return false;
  return /^[A-Za-z0-9+/]+=*$/.test(value);
}
