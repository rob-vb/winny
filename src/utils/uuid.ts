import * as Crypto from "expo-crypto";

// Crypto.randomUUID() is synchronous in expo-crypto — verified: returns string, not Promise
export function generateId(): string {
  return Crypto.randomUUID();
}
