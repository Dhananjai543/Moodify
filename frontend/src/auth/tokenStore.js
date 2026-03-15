// In-memory token storage
let accessToken = null;
let refreshToken = null;
let expiresAt = null;

export function setTokens({ access_token, refresh_token, expires_in }) {
  accessToken = access_token;
  refreshToken = refresh_token;
  expiresAt = Date.now() + expires_in * 1000;
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

export function isTokenExpired() {
  if (!expiresAt) return true;
  return Date.now() >= expiresAt;
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  expiresAt = null;
}
