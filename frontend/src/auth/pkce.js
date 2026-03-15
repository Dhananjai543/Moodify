const VERIFIER_STORAGE_KEY = 'spotify_pkce_code_verifier';

function base64UrlEncode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Random 64-byte base64url-encoded string
export function generateCodeVerifier() {
  const bytes = crypto.getRandomValues(new Uint8Array(64));
  return base64UrlEncode(bytes);
}

// SHA-256 hash, base64url-encoded
export async function generateCodeChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return base64UrlEncode(digest);
}

export function storeCodeVerifier(verifier) {
  sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);
}

export function retrieveCodeVerifier() {
  return sessionStorage.getItem(VERIFIER_STORAGE_KEY);
}

export function clearCodeVerifier() {
  sessionStorage.removeItem(VERIFIER_STORAGE_KEY);
}
