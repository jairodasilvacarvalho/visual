const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";
const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "currentUser";
const USER_ID_STORAGE_KEY = "currentUserId";

function getStorage(remember = true) {
  if (typeof window === "undefined") {
    return null;
  }

  return remember ? window.localStorage : window.sessionStorage;
}

function readStorageValue(key) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
}

function clearStorageValue(key) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
  window.sessionStorage.removeItem(key);
}

function decodeJwtPayload(token) {
  const [, payload] = String(token || "").split(".");

  if (!payload || typeof window === "undefined") {
    return null;
  }

  try {
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      "="
    );

    return JSON.parse(window.atob(paddedPayload));
  } catch {
    return null;
  }
}

function extractUserFromAuthResponse(result) {
  if (result?.user) {
    return result.user;
  }

  const payload = decodeJwtPayload(result?.token);

  return payload
    ? {
        id: payload.userId || payload.sub,
        email: payload.email
      }
    : null;
}

function persistAuthSession({ token, user }, remember = true) {
  const storage = getStorage(remember);

  if (!storage || !token) {
    return;
  }

  clearStorageValue(TOKEN_STORAGE_KEY);
  clearStorageValue(USER_STORAGE_KEY);
  clearStorageValue(USER_ID_STORAGE_KEY);

  storage.setItem(TOKEN_STORAGE_KEY, token);

  if (user) {
    storage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    if (user.id || user.userId || user.user_id) {
      storage.setItem(USER_ID_STORAGE_KEY, String(user.id || user.userId || user.user_id));
    }
  }
}

async function parseResponse(response) {
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.error || result.message || "Não foi possível concluir a autenticação.");
  }

  return result;
}

export function getToken() {
  return readStorageValue(TOKEN_STORAGE_KEY);
}

export function getCurrentUser() {
  const storedUser = readStorageValue(USER_STORAGE_KEY);

  if (storedUser) {
    try {
      return JSON.parse(storedUser);
    } catch {
      clearStorageValue(USER_STORAGE_KEY);
    }
  }

  const payload = decodeJwtPayload(getToken());

  return payload
    ? {
        id: payload.userId || payload.sub,
        email: payload.email
      }
    : null;
}

export async function login({ email, password, remember = true }) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ email, password })
  });
  const result = await parseResponse(response);
  const user = extractUserFromAuthResponse(result);

  persistAuthSession({ token: result.token, user }, remember);

  return {
    ...result,
    user
  };
}

export async function register({ email, password, remember = true }) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify({ email, password })
  });
  const result = await parseResponse(response);
  const user = extractUserFromAuthResponse(result);

  persistAuthSession({ token: result.token, user }, remember);

  return {
    ...result,
    user
  };
}

export function logout() {
  clearStorageValue(TOKEN_STORAGE_KEY);
  clearStorageValue(USER_STORAGE_KEY);
  clearStorageValue(USER_ID_STORAGE_KEY);
}

export async function getAuthenticatedUser() {
  const response = await authenticatedFetch(`${API_BASE_URL}/auth/me`);
  const user = await parseResponse(response);

  persistAuthSession({ token: getToken(), user });

  return user;
}

export function authenticatedFetch(input, init = {}) {
  const token = getToken();
  const headers = new Headers(init.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers
  });
}
