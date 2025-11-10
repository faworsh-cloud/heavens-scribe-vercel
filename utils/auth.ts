// Function to convert ArrayBuffer to hex string
const bufferToHex = (buffer: ArrayBuffer): string => {
  return [...new Uint8Array(buffer)]
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Hashes a PIN using SHA-256.
 * @param pin The PIN string to hash.
 * @returns A promise that resolves to the hex-encoded hash string.
 */
export const hashPin = async (pin: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
};

/**
 * Verifies a PIN against a known hash.
 * @param pin The PIN string to verify.
 * @param hash The known hash string to compare against.
 * @returns A promise that resolves to true if the PIN is correct, false otherwise.
 */
export const verifyPin = async (pin: string, hash: string): Promise<boolean> => {
  const newHash = await hashPin(pin);
  return newHash === hash;
};