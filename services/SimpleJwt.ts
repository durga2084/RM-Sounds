const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function b64Encode(bytes: Uint8Array) {
  if (typeof btoa === "function") {
    return btoa(String.fromCharCode(...bytes));
  }
  return Buffer.from(bytes).toString("base64");
}

function b64Decode(base64: string) {
  if (typeof atob === "function") {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

function base64urlEncode(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  const base64 = b64Encode(bytes);
  return base64.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64urlDecode(input: string) {
  const base64 =
    input.replace(/-/g, "+").replace(/_/g, "/") +
    "=".repeat((4 - (input.length % 4)) % 4);
  return b64Decode(base64);
}

function arrayBufferToString(buffer: ArrayBuffer | Uint8Array) {
  return textDecoder.decode(
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer),
  );
}

function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  throw new Error("Web Crypto API unavailable");
}

async function getSigningKey(secret: string) {
  const keyData = textEncoder.encode(secret);
  const subtle = getSubtleCrypto();
  return subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export async function sign(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSeconds = 7 * 24 * 60 * 60,
) {
  const header = { alg: "HS256", typ: "JWT" };
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const body = { ...payload, exp };
  const headerB64 = base64urlEncode(textEncoder.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(textEncoder.encode(JSON.stringify(body)));
  const key = await getSigningKey(secret);
  const subtle = getSubtleCrypto();
  const signature = await subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(`${headerB64}.${payloadB64}`),
  );
  const sigB64 = base64urlEncode(signature);
  return `${headerB64}.${payloadB64}.${sigB64}`;
}

export async function verify(token: string, secret: string) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [headerB64, payloadB64, sigB64] = parts;
  const key = await getSigningKey(secret);
  const subtle = getSubtleCrypto();
  const signature = await subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(`${headerB64}.${payloadB64}`),
  );

  const expectedSigB64 = base64urlEncode(signature);
  if (!timingSafeEqual(expectedSigB64, sigB64)) {
    throw new Error("Invalid token signature");
  }

  const payloadJson = arrayBufferToString(base64urlDecode(payloadB64));
  const payload = JSON.parse(payloadJson) as Record<string, unknown> & {
    exp?: number;
  };

  if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
    throw new Error("Token expired");
  }
  
  return payload;
}
