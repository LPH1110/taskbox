import crypto from "crypto";
import { env } from "../config/env";
import { Logger } from "./logger";

const ALGORITHM = "aes-256-cbc";

// 32 bytes key expected for aes-256-cbc
// If ENCRYPTION_KEY is not 32 bytes, we hash it to make it 32 bytes
function getKey(): Buffer {
  const secret = env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || "default_insecure_development_key";
  return crypto.createHash('sha256').update(String(secret)).digest();
}

export function encrypt(text: string): string | null {
  try {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return `${iv.toString("hex")}:${encrypted}`;
  } catch (error) {
    Logger.error("Encryption", "Failed to encrypt data", error);
    return null;
  }
}

export function decrypt(hash: string): string | null {
  try {
    if (!hash) return null;
    const parts = hash.split(":");
    if (parts.length !== 2) return null;
    const iv = Buffer.from(parts[0], "hex");
    const encryptedText = Buffer.from(parts[1], "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    Logger.error("Encryption", "Failed to decrypt data", error);
    return null;
  }
}
